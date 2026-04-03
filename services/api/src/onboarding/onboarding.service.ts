import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OnboardingService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createSchool(data: {
    schoolName: string;
    board?: string;
    city?: string;
    state?: string;
    adminName: string;
    adminEmail: string;
    adminPhone: string;
    password: string;
  }) {
    const subdomain = data.schoolName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const existing = await this.prisma.tenant.findFirst({
      where: { OR: [{ subdomain }, { name: data.schoolName }] },
    });
    if (existing) {
      throw new BadRequestException('A school with this name already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: data.schoolName,
          subdomain,
          board: data.board,
          city: data.city,
          state: data.state,
          isActive: false,
          onboardingStep: 1,
          onboardingComplete: false,
          theme: {},
          config: {},
        },
      });

      const [firstName, ...lastParts] = data.adminName.split(' ');
      const lastName = lastParts.join(' ') || '';

      const admin = await tx.user.create({
        data: {
          email: data.adminEmail,
          passwordHash,
          role: 'ADMIN',
          tenantId: tenant.id,
          profile: { firstName, lastName, phone: data.adminPhone },
          isActive: true,
        },
      });

      return { tenant, admin };
    });

    const payload = {
      sub: result.admin.id,
      jti: randomUUID(),
      email: result.admin.email,
      role: result.admin.role,
      tenantId: result.tenant.id,
    };

    return {
      tenantId: result.tenant.id,
      accessToken: this.jwtService.sign(payload),
      user: {
        id: result.admin.id,
        email: result.admin.email,
        role: result.admin.role,
        profile: result.admin.profile,
      },
    };
  }

  async createClasses(tenantId: string, grades: { gradeLevel: string; sections: string[] }[]) {
    const classData = grades.flatMap((g) =>
      g.sections.map((section) => ({
        name: `Class ${g.gradeLevel}-${section}`,
        gradeLevel: g.gradeLevel,
        section,
        tenantId,
        isActive: true,
        schedule: [],
      })),
    );

    await this.prisma.class.createMany({ data: classData });
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { onboardingStep: 2 },
    });

    return { classesCreated: classData.length };
  }

  async importStudents(
    tenantId: string,
    students: {
      firstName: string;
      lastName: string;
      gradeLevel: string;
      section?: string;
      enrollmentNumber: string;
      parentName: string;
      parentPhone: string;
      parentEmail?: string;
    }[],
  ) {
    let studentsCreated = 0;
    let parentsCreated = 0;

    // Group by parent phone for dedup
    const parentMap = new Map<string, typeof students>();
    for (const s of students) {
      const phone = s.parentPhone.replace(/\D/g, '').slice(-10);
      if (!parentMap.has(phone)) parentMap.set(phone, []);
      parentMap.get(phone)!.push(s);
    }

    await this.prisma.$transaction(async (tx) => {
      for (const [phone, children] of parentMap) {
        const first = children[0];
        const [pFirstName, ...pLastParts] = first.parentName.split(' ');
        const pLastName = pLastParts.join(' ') || '';
        const parentPassword = await bcrypt.hash(phone, 12);

        const parentUser = await tx.user.create({
          data: {
            email: first.parentEmail || `parent.${phone}@${tenantId}.local`,
            passwordHash: parentPassword,
            role: 'PARENT',
            tenantId,
            profile: { firstName: pFirstName, lastName: pLastName, phone },
            isActive: true,
          },
        });

        const parentProfile = await tx.parentProfile.create({
          data: {
            userId: parentUser.id,
            tenantId,
            relationshipType: 'GUARDIAN',
            isActive: true,
          },
        });
        parentsCreated++;

        for (const child of children) {
          await tx.student.create({
            data: {
              firstName: child.firstName,
              lastName: child.lastName,
              gradeLevel: child.gradeLevel,
              section: child.section,
              enrollmentNumber: child.enrollmentNumber,
              tenantId,
              parentId: parentProfile.id,
              isActive: true,
            },
          });
          studentsCreated++;
        }
      }
    });

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { onboardingStep: 3 },
    });

    return { studentsCreated, parentsCreated };
  }

  async createTeachers(
    tenantId: string,
    teachers: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      subject?: string;
      classIds?: string[];
    }[],
  ) {
    let teachersCreated = 0;

    for (const t of teachers) {
      const phone = t.phone.replace(/\D/g, '').slice(-10);
      const passwordHash = await bcrypt.hash(phone, 12);

      await this.prisma.$transaction(async (tx) => {
        await tx.user.create({
          data: {
            email: t.email,
            passwordHash,
            role: 'TEACHER',
            tenantId,
            profile: { firstName: t.firstName, lastName: t.lastName, phone: t.phone },
            isActive: true,
          },
        });

        const teacher = await tx.teacher.create({
          data: {
            firstName: t.firstName,
            lastName: t.lastName,
            email: t.email,
            phone: t.phone,
            subject: t.subject,
            tenantId,
            isActive: true,
          },
        });

        if (t.classIds?.length) {
          await tx.class.updateMany({
            where: { id: { in: t.classIds }, tenantId },
            data: { teacherId: teacher.id },
          });
        }
      });

      teachersCreated++;
    }

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { onboardingStep: 4 },
    });

    return { teachersCreated };
  }

  async createFeeStructure(
    tenantId: string,
    data: {
      academicYear: string;
      feeTypes: {
        type: string;
        amount: number;
        grades: string[];
        dueDate: string;
      }[];
    },
  ) {
    let feesCreated = 0;

    for (const feeType of data.feeTypes) {
      const students = await this.prisma.student.findMany({
        where: {
          tenantId,
          gradeLevel: { in: feeType.grades },
          isActive: true,
        },
        select: { id: true },
      });

      if (students.length > 0) {
        const feeRecords = students.map((s) => ({
          studentId: s.id,
          tenantId,
          type: feeType.type,
          amount: feeType.amount,
          dueDate: new Date(feeType.dueDate),
          status: 'PENDING' as const,
          academicYear: data.academicYear,
        }));

        await this.prisma.fee.createMany({ data: feeRecords });
        feesCreated += feeRecords.length;
      }
    }

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { onboardingStep: 5 },
    });

    return { feesCreated };
  }

  async getSummary(tenantId: string) {
    const [students, teachers, classes, fees, parents] = await Promise.all([
      this.prisma.student.count({ where: { tenantId, isActive: true } }),
      this.prisma.teacher.count({ where: { tenantId, isActive: true } }),
      this.prisma.class.count({ where: { tenantId, isActive: true } }),
      this.prisma.fee.count({ where: { tenantId } }),
      this.prisma.parentProfile.count({ where: { tenantId, isActive: true } }),
    ]);

    return { students, teachers, classes, fees, parents };
  }

  async goLive(tenantId: string) {
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive: true, onboardingComplete: true, onboardingStep: 6 },
    });
    return { message: 'School is now live!' };
  }

  async getStatus(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { onboardingStep: true, onboardingComplete: true, name: true },
    });
    return tenant;
  }

  getCsvTemplate(): string {
    return 'firstName,lastName,gradeLevel,section,enrollmentNumber,parentName,parentPhone,parentEmail\nRahul,Sharma,10,A,ENR001,Vishal Sharma,9876543210,parent@email.com';
  }
}

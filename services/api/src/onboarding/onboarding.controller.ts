import { Controller, Post, Get, Body, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { OnboardingService } from './onboarding.service';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Public()
  @Post('school')
  async createSchool(
    @Body()
    body: {
      schoolName: string;
      board?: string;
      city?: string;
      state?: string;
      adminName: string;
      adminEmail: string;
      adminPhone: string;
      password: string;
    },
  ) {
    const result = await this.onboardingService.createSchool(body);
    return { success: true, data: result };
  }

  @Post(':tenantId/classes')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async createClasses(
    @Param('tenantId') tenantId: string,
    @Body() body: { grades: { gradeLevel: string; sections: string[] }[] },
  ) {
    const result = await this.onboardingService.createClasses(tenantId, body.grades);
    return { success: true, data: result };
  }

  @Post(':tenantId/students/import')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async importStudents(
    @Param('tenantId') tenantId: string,
    @Body()
    body: {
      students: {
        firstName: string;
        lastName: string;
        gradeLevel: string;
        section?: string;
        enrollmentNumber: string;
        parentName: string;
        parentPhone: string;
        parentEmail?: string;
      }[];
    },
  ) {
    const result = await this.onboardingService.importStudents(tenantId, body.students);
    return { success: true, data: result };
  }

  @Get(':tenantId/students/csv-template')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @SkipThrottle()
  async getCsvTemplate(@Res() res: Response) {
    const csv = this.onboardingService.getCsvTemplate();
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="student-import-template.csv"',
    });
    res.send(csv);
  }

  @Post(':tenantId/teachers')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async createTeachers(
    @Param('tenantId') tenantId: string,
    @Body()
    body: {
      teachers: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        subject?: string;
        classIds?: string[];
      }[];
    },
  ) {
    const result = await this.onboardingService.createTeachers(tenantId, body.teachers);
    return { success: true, data: result };
  }

  @Post(':tenantId/fee-structure')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async createFeeStructure(
    @Param('tenantId') tenantId: string,
    @Body()
    body: {
      academicYear: string;
      feeTypes: {
        type: string;
        amount: number;
        grades: string[];
        dueDate: string;
      }[];
    },
  ) {
    const result = await this.onboardingService.createFeeStructure(tenantId, body);
    return { success: true, data: result };
  }

  @Get(':tenantId/summary')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getSummary(@Param('tenantId') tenantId: string) {
    const result = await this.onboardingService.getSummary(tenantId);
    return { success: true, data: result };
  }

  @Post(':tenantId/go-live')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async goLive(@Param('tenantId') tenantId: string) {
    const result = await this.onboardingService.goLive(tenantId);
    return { success: true, data: result };
  }

  @Get(':tenantId/status')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getStatus(@Param('tenantId') tenantId: string) {
    const result = await this.onboardingService.getStatus(tenantId);
    return { success: true, data: result };
  }
}

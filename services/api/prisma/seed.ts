import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const hashPassword = async (password: string) => bcrypt.hash(password, 12);

// ============ INDIAN NAMES DATA ============
const firstNames = [
  'Aarav','Vivaan','Aditya','Vihaan','Arjun','Reyansh','Sai','Arnav','Dhruv','Kabir',
  'Ananya','Diya','Myra','Sara','Aanya','Aadhya','Isha','Pari','Riya','Navya',
  'Rohan','Ishaan','Kian','Shaurya','Atharv','Advait','Ayaan','Pranav','Harsh','Dev',
  'Kiara','Avni','Mahi','Prisha','Anvi','Saanvi','Amaira','Khushi','Nisha','Tara',
  'Rahul','Sneha','Pooja','Vikram','Neha','Amit','Priya','Raj','Simran','Gaurav',
  'Tanvi','Aryan','Meera','Krish','Lakshmi','Varun','Kavya','Nikhil','Divya','Manish',
  'Ritika','Sahil','Jaya','Kunal','Shreya','Akash','Pallavi','Vishal','Swati','Ravi',
  'Anjali','Deepak','Nidhi','Sanjay','Bhavna','Mohit','Komal','Suresh','Geeta','Pankaj',
  'Aisha','Yash','Zara','Om','Sia','Ved','Pihu','Rudra','Mira','Veer',
  'Aditi','Rishabh','Lavanya','Parth','Sakshi','Kartik','Trisha','Aman','Jasmine','Tushar',
];
const lastNames = [
  'Sharma','Gupta','Patel','Singh','Kumar','Verma','Joshi','Agarwal','Mehta','Reddy',
  'Nair','Iyer','Chauhan','Yadav','Mishra','Tiwari','Saxena','Pandey','Malhotra','Bhat',
  'Chopra','Kapoor','Desai','Shah','Menon','Pillai','Rao','Das','Sinha','Banerjee',
];
const subjects = ['Mathematics','Physics','Chemistry','Biology','English','Hindi','History','Geography','Computer Science','Economics','Political Science','Accountancy'];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

async function main() {
  console.log('🌱 Starting comprehensive database seed...\n');

  // ========================================
  // TENANTS (3 Schools)
  // ========================================
  console.log('📦 Creating 3 schools (tenants)...');

  const school1 = await prisma.tenant.upsert({
    where: { subdomain: 'vidyamandir' },
    update: { primaryDomain: 'vidyamandir.localhost' },
    create: {
      name: 'Vidyamandir Classes',
      primaryDomain: 'vidyamandir.localhost',
      subdomain: 'vidyamandir',
      theme: {
        logo: '/logos/vidyamandir.svg',
        colors: { primary: 'hsl(221 83% 53%)', secondary: 'hsl(210 40% 96.1%)', accent: 'hsl(210 40% 96.1%)', background: 'hsl(0 0% 100%)', foreground: 'hsl(222.2 84% 4.9%)' },
        fonts: { heading: 'Poppins, sans-serif', body: 'Inter, sans-serif' },
      },
      config: { features: { attendance: true, fees: true, messaging: true, commission: true, reports: true }, locale: 'en-IN', timezone: 'Asia/Kolkata', currency: 'INR' },
      isActive: true,
    },
  });

  const school2 = await prisma.tenant.upsert({
    where: { subdomain: 'dps' },
    update: { primaryDomain: 'dps.localhost' },
    create: {
      name: 'Delhi Public School',
      primaryDomain: 'dps.localhost',
      subdomain: 'dps',
      theme: {
        logo: '/logos/dps.svg',
        colors: { primary: 'hsl(142 76% 36%)', secondary: 'hsl(143 64% 94%)', accent: 'hsl(142 76% 36%)', background: 'hsl(0 0% 100%)', foreground: 'hsl(222.2 84% 4.9%)' },
        fonts: { heading: 'Inter, sans-serif', body: 'Inter, sans-serif' },
      },
      config: { features: { attendance: true, fees: true, messaging: true, commission: false, reports: true }, locale: 'en-IN', timezone: 'Asia/Kolkata', currency: 'INR' },
      isActive: true,
    },
  });

  const school3 = await prisma.tenant.upsert({
    where: { subdomain: 'sunrise' },
    update: { primaryDomain: 'sunrise.localhost' },
    create: {
      name: 'Sunrise Global Academy',
      primaryDomain: 'sunrise.localhost',
      subdomain: 'sunrise',
      theme: {
        logo: '/logos/sunrise.svg',
        colors: { primary: 'hsl(25 95% 53%)', secondary: 'hsl(30 80% 95%)', accent: 'hsl(25 95% 53%)', background: 'hsl(0 0% 100%)', foreground: 'hsl(222.2 84% 4.9%)' },
        fonts: { heading: 'Poppins, sans-serif', body: 'Inter, sans-serif' },
      },
      config: { features: { attendance: true, fees: true, messaging: true, commission: true, reports: true }, locale: 'en-IN', timezone: 'Asia/Kolkata', currency: 'INR' },
      isActive: true,
    },
  });

  const schools = [school1, school2, school3];
  console.log(`✅ Created 3 schools: ${schools.map(s => s.name).join(', ')}\n`);

  // ========================================
  // BROKERS (per school that has commission feature)
  // ========================================
  console.log('🏢 Creating broker hierarchies...');

  const allBrokers: Record<string, any[]> = {};

  for (const school of [school1, school3]) { // school2 has commission disabled
    const prefix = school.id === school1.id ? 'VM' : 'SGA';
    const topBroker = await prisma.broker.upsert({
      where: { code_tenantId: { code: `${prefix}-BRK-001`, tenantId: school.id } },
      update: {},
      create: { name: `${school.name} Master Agency`, code: `${prefix}-BRK-001`, tenantId: school.id, level: 0, metadata: { region: 'North India', type: 'Master' }, isActive: true },
    });
    const subBroker1 = await prisma.broker.upsert({
      where: { code_tenantId: { code: `${prefix}-BRK-002`, tenantId: school.id } },
      update: {},
      create: { name: `${prefix} Delhi Sub-Broker`, code: `${prefix}-BRK-002`, parentBrokerId: topBroker.id, tenantId: school.id, level: 1, metadata: { region: 'Delhi NCR' }, isActive: true },
    });
    const subBroker2 = await prisma.broker.upsert({
      where: { code_tenantId: { code: `${prefix}-BRK-003`, tenantId: school.id } },
      update: {},
      create: { name: `${prefix} Mumbai Sub-Broker`, code: `${prefix}-BRK-003`, parentBrokerId: topBroker.id, tenantId: school.id, level: 1, metadata: { region: 'Mumbai' }, isActive: true },
    });
    const agent1 = await prisma.broker.upsert({
      where: { code_tenantId: { code: `${prefix}-AGT-001`, tenantId: school.id } },
      update: {},
      create: { name: `Agent ${pick(firstNames)} ${pick(lastNames)}`, code: `${prefix}-AGT-001`, parentBrokerId: subBroker1.id, tenantId: school.id, level: 2, metadata: { phone: '+91-98765' + Math.floor(10000 + Math.random() * 90000) }, isActive: true },
    });
    const agent2 = await prisma.broker.upsert({
      where: { code_tenantId: { code: `${prefix}-AGT-002`, tenantId: school.id } },
      update: {},
      create: { name: `Agent ${pick(firstNames)} ${pick(lastNames)}`, code: `${prefix}-AGT-002`, parentBrokerId: subBroker2.id, tenantId: school.id, level: 2, metadata: { phone: '+91-98765' + Math.floor(10000 + Math.random() * 90000) }, isActive: true },
    });

    allBrokers[school.id] = [topBroker, subBroker1, subBroker2, agent1, agent2];

    // Commission rules
    await prisma.commissionRule.createMany({
      data: [
        { brokerId: topBroker.id, name: 'Top Broker - All Fees', level: 0, percentage: 2.0, conditions: { minAmount: 0, feeType: ['TUITION', 'ADMISSION', 'EXAM'] }, priority: 1, isActive: true },
        { brokerId: subBroker1.id, name: 'Sub-Broker Delhi - Tuition', level: 1, percentage: 3.5, conditions: { minAmount: 10000, feeType: ['TUITION'] }, priority: 2, isActive: true },
        { brokerId: subBroker2.id, name: 'Sub-Broker Mumbai - Tuition', level: 1, percentage: 3.0, conditions: { minAmount: 10000, feeType: ['TUITION'] }, priority: 2, isActive: true },
        { brokerId: agent1.id, name: 'Agent - High Value', level: 2, percentage: 5.0, conditions: { minAmount: 50000 }, priority: 3, isActive: true },
        { brokerId: agent2.id, name: 'Agent - Standard', level: 2, percentage: 4.0, conditions: { minAmount: 0 }, priority: 3, isActive: true },
      ],
    });
  }
  console.log(`✅ Created brokers & commission rules for ${Object.keys(allBrokers).length} schools\n`);

  // ========================================
  // USERS (Admin, Teacher, Broker, Parent, Student per school)
  // ========================================
  console.log('👥 Creating users...');

  const allUsers: Record<string, Record<string, any>> = {};
  const schoolConfigs = [
    { school: school1, prefix: 'vidyamandir', domain: 'vidyamandir.com' },
    { school: school2, prefix: 'dps', domain: 'dps.edu.in' },
    { school: school3, prefix: 'sunrise', domain: 'sunriseglobal.com' },
  ];

  for (const { school, prefix, domain } of schoolConfigs) {
    const users: Record<string, any> = {};

    // Super Admin (only for school1)
    if (school.id === school1.id) {
      users.superAdmin = await prisma.user.upsert({
        where: { email_tenantId: { email: `superadmin@${domain}`, tenantId: school.id } },
        update: {},
        create: { email: `superadmin@${domain}`, passwordHash: await hashPassword('super123'), role: 'SUPER_ADMIN', tenantId: school.id, profile: { firstName: 'Super', lastName: 'Admin', phone: '+91-9000000001' }, isActive: true },
      });
    }

    // Admin
    users.admin = await prisma.user.upsert({
      where: { email_tenantId: { email: `admin@${domain}`, tenantId: school.id } },
      update: {},
      create: { email: `admin@${domain}`, passwordHash: await hashPassword('admin123'), role: 'ADMIN', tenantId: school.id, profile: { firstName: 'Admin', lastName: pick(lastNames), phone: '+91-9000000' + Math.floor(100 + Math.random() * 900) }, isActive: true },
    });

    // Teachers (3 per school)
    for (let i = 1; i <= 3; i++) {
      const fn = pick(firstNames);
      const ln = pick(lastNames);
      users[`teacher${i}`] = await prisma.user.upsert({
        where: { email_tenantId: { email: `teacher${i}@${domain}`, tenantId: school.id } },
        update: {},
        create: { email: `teacher${i}@${domain}`, passwordHash: await hashPassword('teacher123'), role: 'TEACHER', tenantId: school.id, profile: { firstName: fn, lastName: ln, phone: '+91-98' + Math.floor(10000000 + Math.random() * 90000000) }, isActive: true },
      });
    }

    // Broker user (if brokers exist for this school)
    if (allBrokers[school.id]) {
      users.broker = await prisma.user.upsert({
        where: { email_tenantId: { email: `broker@${domain}`, tenantId: school.id } },
        update: {},
        create: { email: `broker@${domain}`, passwordHash: await hashPassword('broker123'), role: 'BROKER', tenantId: school.id, brokerId: allBrokers[school.id][0].id, profile: { firstName: 'Master', lastName: 'Broker', phone: '+91-98' + Math.floor(10000000 + Math.random() * 90000000) }, isActive: true },
      });
    }

    // Parent users (20 per school - realistic 1-3 kids each)
    for (let i = 1; i <= 20; i++) {
      const fn = pick(firstNames);
      const ln = pick(lastNames);
      users[`parent${i}`] = await prisma.user.upsert({
        where: { email_tenantId: { email: `parent${i}@${domain}`, tenantId: school.id } },
        update: {},
        create: { email: `parent${i}@${domain}`, passwordHash: await hashPassword('parent123'), role: 'PARENT', tenantId: school.id, profile: { firstName: fn, lastName: ln, phone: '+91-98' + Math.floor(10000000 + Math.random() * 90000000) }, isActive: true },
      });
    }

    allUsers[school.id] = users;
  }
  console.log(`✅ Created users for all 3 schools\n`);

  // ========================================
  // PARENT PROFILES
  // ========================================
  console.log('👨‍👩‍👧 Creating parent profiles...');

  const allParentProfiles: Record<string, any[]> = {};
  for (const { school } of schoolConfigs) {
    const users = allUsers[school.id];
    const profiles: any[] = [];
    for (let i = 1; i <= 20; i++) {
      const parentUser = users[`parent${i}`];
      const rel: ('FATHER' | 'MOTHER' | 'GUARDIAN')[] = ['FATHER', 'MOTHER', 'GUARDIAN'];
      const profile = await prisma.parentProfile.upsert({
        where: { userId: parentUser.id },
        update: {},
        create: {
          userId: parentUser.id,
          tenantId: school.id,
          relationshipType: rel[i % 3],
          occupation: pick(['Engineer', 'Doctor', 'Teacher', 'Business Owner', 'Lawyer', 'Accountant', 'Government Officer', 'Farmer', 'Shopkeeper', 'IT Professional']),
          isActive: true,
        },
      });
      profiles.push(profile);
    }
    allParentProfiles[school.id] = profiles;
  }
  console.log(`✅ Created parent profiles (20 per school)\n`);

  // ========================================
  // TEACHERS (detailed records per school)
  // ========================================
  console.log('👨‍🏫 Creating teacher records...');

  const allTeachers: Record<string, any[]> = {};

  const teacherData = [
    // School 1 - 6 teachers
    [
      { fn: 'Priya', ln: 'Sharma', sub: 'Mathematics' },
      { fn: 'Amit', ln: 'Verma', sub: 'Physics' },
      { fn: 'Sunita', ln: 'Gupta', sub: 'Chemistry' },
      { fn: 'Rajesh', ln: 'Kumar', sub: 'English' },
      { fn: 'Deepa', ln: 'Nair', sub: 'Biology' },
      { fn: 'Vikram', ln: 'Joshi', sub: 'Computer Science' },
    ],
    // School 2 - 6 teachers
    [
      { fn: 'Anita', ln: 'Desai', sub: 'Mathematics' },
      { fn: 'Suresh', ln: 'Pillai', sub: 'Physics' },
      { fn: 'Meena', ln: 'Rao', sub: 'Chemistry' },
      { fn: 'Arun', ln: 'Chauhan', sub: 'Hindi' },
      { fn: 'Kavita', ln: 'Mehta', sub: 'History' },
      { fn: 'Prakash', ln: 'Sinha', sub: 'Economics' },
    ],
    // School 3 - 6 teachers
    [
      { fn: 'Neelam', ln: 'Kapoor', sub: 'Mathematics' },
      { fn: 'Ravi', ln: 'Tiwari', sub: 'Physics' },
      { fn: 'Shalini', ln: 'Pandey', sub: 'English' },
      { fn: 'Manoj', ln: 'Saxena', sub: 'Geography' },
      { fn: 'Pooja', ln: 'Malhotra', sub: 'Biology' },
      { fn: 'Tarun', ln: 'Bhat', sub: 'Accountancy' },
    ],
  ];

  for (let si = 0; si < schools.length; si++) {
    const school = schools[si];
    const teachers: any[] = [];
    for (let ti = 0; ti < teacherData[si].length; ti++) {
      const t = teacherData[si][ti];
      const email = `${t.fn.toLowerCase()}.${t.ln.toLowerCase()}@${schoolConfigs[si].domain}`;
      const teacher = await prisma.teacher.upsert({
        where: { email_tenantId: { email, tenantId: school.id } },
        update: {},
        create: {
          firstName: t.fn, lastName: t.ln, email, phone: '+91-98' + Math.floor(10000000 + Math.random() * 90000000),
          tenantId: school.id, subject: t.sub,
          metadata: { qualification: `M.Sc ${t.sub}`, experience: `${5 + Math.floor(Math.random() * 15)} years` },
          isActive: true,
        },
      });
      teachers.push(teacher);
    }
    allTeachers[school.id] = teachers;
  }
  console.log(`✅ Created ${Object.values(allTeachers).flat().length} teachers\n`);

  // ========================================
  // CLASSES (multiple per school, grades 6-12)
  // ========================================
  console.log('🎓 Creating classes...');

  const allClasses: Record<string, any[]> = {};
  const gradeLevels = ['6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C'];

  for (let si = 0; si < schools.length; si++) {
    const school = schools[si];
    const teachers = allTeachers[school.id];
    const classes: any[] = [];

    // Create classes: grades 9-12 with sections A & B = 8 classes per school
    const classGrades = ['9', '10', '11', '12'];
    const classSections = ['A', 'B'];
    let teacherIdx = 0;

    for (const grade of classGrades) {
      for (const section of classSections) {
        const teacher = teachers[teacherIdx % teachers.length];
        const daySchedules = [
          { dayOfWeek: 1, startTime: '09:00', endTime: '09:45', subject: teacher.subject },
          { dayOfWeek: 3, startTime: '09:00', endTime: '09:45', subject: teacher.subject },
          { dayOfWeek: 5, startTime: '10:00', endTime: '10:45', subject: teacher.subject },
        ];

        const cls = await prisma.class.create({
          data: {
            name: `Class ${grade}-${section}`,
            gradeLevel: grade,
            section,
            tenantId: school.id,
            teacherId: teacher.id,
            schedule: daySchedules,
            isActive: true,
          },
        });
        classes.push(cls);
        teacherIdx++;
      }
    }
    allClasses[school.id] = classes;
  }
  console.log(`✅ Created ${Object.values(allClasses).flat().length} classes across 3 schools\n`);

  // ========================================
  // STUDENTS (100+ total, distributed across schools)
  // School 1: 40, School 2: 35, School 3: 30
  // ========================================
  console.log('👨‍🎓 Creating 105 students...');

  const allStudents: Record<string, any[]> = {};
  const studentCounts = [40, 35, 30];
  let nameIdx = 0;

  for (let si = 0; si < schools.length; si++) {
    const school = schools[si];
    const classes = allClasses[school.id];
    const brokers = allBrokers[school.id] || [];
    const parents = allParentProfiles[school.id] || [];
    const prefix = ['VM', 'DPS', 'SGA'][si];
    const students: any[] = [];

    for (let i = 1; i <= studentCounts[si]; i++) {
      const fn = firstNames[nameIdx % firstNames.length];
      const ln = lastNames[nameIdx % lastNames.length];
      nameIdx++;

      const cls = classes[i % classes.length];
      const broker = brokers.length > 0 ? brokers[i % brokers.length] : null;
      // Realistic: first 15 parents get 2 kids each (30 students), remaining 10 get 1 kid
      // This gives parent1 students 0,1 | parent2 students 2,3 | etc
      const parentIndex = Math.floor(i / 2); // 2 kids per parent
      const parent = parents.length > 0 ? parents[parentIndex % parents.length] : null;
      const enrollNum = `${prefix}2025${String(i).padStart(3, '0')}`;

      const student = await prisma.student.upsert({
        where: { enrollmentNumber_tenantId: { enrollmentNumber: enrollNum, tenantId: school.id } },
        update: {},
        create: {
          firstName: fn,
          lastName: ln,
          email: `${fn.toLowerCase()}.${ln.toLowerCase()}.${enrollNum.toLowerCase()}@students.${schoolConfigs[si].domain}`,
          phone: i % 3 === 0 ? '+91-' + (7000000000 + Math.floor(Math.random() * 3000000000)) : undefined,
          tenantId: school.id,
          brokerId: broker?.id,
          enrollmentNumber: enrollNum,
          gradeLevel: cls.gradeLevel,
          section: cls.section,
          parentId: parent?.id,
          metadata: {
            dateOfBirth: `200${7 + Math.floor(Math.random() * 5)}-${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}-${String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')}`,
            bloodGroup: pick(['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-']),
            address: `${Math.floor(1 + Math.random() * 500)}, ${pick(['MG Road', 'Park Street', 'Nehru Nagar', 'Gandhi Colony', 'Shanti Nagar', 'Lajpat Nagar', 'Civil Lines', 'Rajpur Road'])}, ${pick(['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Jaipur'])}`,
          },
          isActive: true,
        },
      });
      students.push(student);
    }
    allStudents[school.id] = students;
  }
  console.log(`✅ Created ${Object.values(allStudents).flat().length} students\n`);

  // ========================================
  // FEES (2-3 fees per student)
  // ========================================
  console.log('💵 Creating fees...');

  const allFees: Record<string, any[]> = {};
  const feeTypes = ['TUITION', 'ADMISSION', 'EXAM', 'LIBRARY', 'TRANSPORT', 'LABORATORY'];
  const feeAmounts: Record<string, [number, number]> = {
    TUITION: [30000, 75000],
    ADMISSION: [15000, 35000],
    EXAM: [2000, 8000],
    LIBRARY: [1000, 5000],
    TRANSPORT: [5000, 15000],
    LABORATORY: [3000, 10000],
  };

  for (let si = 0; si < schools.length; si++) {
    const school = schools[si];
    const students = allStudents[school.id];
    const fees: any[] = [];

    for (const student of students) {
      // Every student gets tuition fee
      const tuitionAmt = feeAmounts.TUITION[0] + Math.floor(Math.random() * (feeAmounts.TUITION[1] - feeAmounts.TUITION[0]));
      const tuitionStatus = pick(['PAID', 'PAID', 'PAID', 'PENDING', 'OVERDUE']) as any; // 60% paid
      fees.push(await prisma.fee.create({
        data: {
          studentId: student.id, tenantId: school.id, type: 'TUITION',
          amount: tuitionAmt,
          dueDate: new Date('2025-06-01'),
          status: tuitionStatus,
          description: 'Annual Tuition Fee 2025-26',
          academicYear: '2025-2026',
        },
      }));

      // 70% get exam fee
      if (Math.random() < 0.7) {
        const examAmt = feeAmounts.EXAM[0] + Math.floor(Math.random() * (feeAmounts.EXAM[1] - feeAmounts.EXAM[0]));
        fees.push(await prisma.fee.create({
          data: {
            studentId: student.id, tenantId: school.id, type: 'EXAM',
            amount: examAmt,
            dueDate: new Date('2025-09-15'),
            status: pick(['PAID', 'PENDING', 'PENDING']) as any,
            description: 'Mid-Term Exam Fee',
            academicYear: '2025-2026',
          },
        }));
      }

      // 50% get transport fee
      if (Math.random() < 0.5) {
        const transAmt = feeAmounts.TRANSPORT[0] + Math.floor(Math.random() * (feeAmounts.TRANSPORT[1] - feeAmounts.TRANSPORT[0]));
        fees.push(await prisma.fee.create({
          data: {
            studentId: student.id, tenantId: school.id, type: 'TRANSPORT',
            amount: transAmt,
            dueDate: new Date('2025-07-01'),
            status: pick(['PAID', 'PENDING']) as any,
            description: 'Annual Transport Fee',
            academicYear: '2025-2026',
          },
        }));
      }

      // 40% get library fee
      if (Math.random() < 0.4) {
        const libAmt = feeAmounts.LIBRARY[0] + Math.floor(Math.random() * (feeAmounts.LIBRARY[1] - feeAmounts.LIBRARY[0]));
        fees.push(await prisma.fee.create({
          data: {
            studentId: student.id, tenantId: school.id, type: 'LIBRARY',
            amount: libAmt,
            dueDate: new Date('2025-05-15'),
            status: pick(['PAID', 'PAID', 'PENDING', 'WAIVED']) as any,
            description: 'Annual Library Fee',
            academicYear: '2025-2026',
          },
        }));
      }
    }
    // Previous academic year fees (2024-2025) - mostly paid, gives historical data
    for (const student of students) {
      const prevTuition = feeAmounts.TUITION[0] + Math.floor(Math.random() * (feeAmounts.TUITION[1] - feeAmounts.TUITION[0]));
      fees.push(await prisma.fee.create({
        data: {
          studentId: student.id, tenantId: school.id, type: 'TUITION',
          amount: prevTuition,
          dueDate: new Date('2024-06-01'),
          status: pick(['PAID', 'PAID', 'PAID', 'PAID', 'PAID', 'WAIVED']) as any,
          description: 'Annual Tuition Fee 2024-25',
          academicYear: '2024-2025',
        },
      }));

      // Q1 fee
      fees.push(await prisma.fee.create({
        data: {
          studentId: student.id, tenantId: school.id, type: 'TUITION',
          amount: Math.round(prevTuition / 4),
          dueDate: new Date('2024-07-15'),
          status: 'PAID' as any,
          description: 'Q1 Tuition Fee 2024-25',
          academicYear: '2024-2025',
        },
      }));

      // Q2 fee
      fees.push(await prisma.fee.create({
        data: {
          studentId: student.id, tenantId: school.id, type: 'TUITION',
          amount: Math.round(prevTuition / 4),
          dueDate: new Date('2024-10-15'),
          status: 'PAID' as any,
          description: 'Q2 Tuition Fee 2024-25',
          academicYear: '2024-2025',
        },
      }));

      // Q3 fee
      fees.push(await prisma.fee.create({
        data: {
          studentId: student.id, tenantId: school.id, type: 'TUITION',
          amount: Math.round(prevTuition / 4),
          dueDate: new Date('2025-01-15'),
          status: pick(['PAID', 'PAID', 'PAID', 'PENDING']) as any,
          description: 'Q3 Tuition Fee 2024-25',
          academicYear: '2024-2025',
        },
      }));

      // Exam fee prev year
      fees.push(await prisma.fee.create({
        data: {
          studentId: student.id, tenantId: school.id, type: 'EXAM',
          amount: feeAmounts.EXAM[0] + Math.floor(Math.random() * (feeAmounts.EXAM[1] - feeAmounts.EXAM[0])),
          dueDate: new Date('2024-09-01'),
          status: 'PAID' as any,
          description: 'Annual Exam Fee 2024-25',
          academicYear: '2024-2025',
        },
      }));

      // Admission fee (one-time, prev year)
      if (Math.random() < 0.3) {
        fees.push(await prisma.fee.create({
          data: {
            studentId: student.id, tenantId: school.id, type: 'ADMISSION',
            amount: feeAmounts.ADMISSION[0] + Math.floor(Math.random() * (feeAmounts.ADMISSION[1] - feeAmounts.ADMISSION[0])),
            dueDate: new Date('2024-04-01'),
            status: 'PAID' as any,
            description: 'One-time Admission Fee',
            academicYear: '2024-2025',
          },
        }));
      }
    }

    allFees[school.id] = fees;
  }
  console.log(`✅ Created ${Object.values(allFees).flat().length} fee records (2 academic years)\n`);

  // ========================================
  // PAYMENTS & COMMISSIONS (for PAID fees)
  // ========================================
  console.log('💳 Creating payments & commissions...');

  const paymentMethods = ['UPI', 'CARD', 'CASH', 'BANK_TRANSFER', 'CHEQUE'];
  let paymentCount = 0;
  let commissionCount = 0;

  for (let si = 0; si < schools.length; si++) {
    const school = schools[si];
    const fees = allFees[school.id];
    const brokers = allBrokers[school.id] || [];
    const paidFees = fees.filter((f: any) => f.status === 'PAID');

    for (const fee of paidFees) {
      const payment = await prisma.payment.create({
        data: {
          feeId: fee.id,
          studentId: fee.studentId,
          tenantId: school.id,
          amount: fee.amount,
          paymentMethod: pick(paymentMethods),
          transactionId: `TXN-${school.name.substring(0, 3).toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          status: 'COMPLETED',
          paidAt: new Date(fee.dueDate.getTime() - Math.floor(Math.random() * 30) * 86400000), // Paid within 30 days before due date
          metadata: {},
        },
      });
      paymentCount++;

      // Create commissions for schools with brokers
      if (brokers.length > 0 && fee.type === 'TUITION' && fee.amount >= 30000) {
        // Agent commission (5%)
        const agent = brokers[3] || brokers[brokers.length - 1];
        await prisma.commission.create({
          data: {
            tenantId: school.id, brokerId: agent.id, paymentId: payment.id,
            amount: fee.amount * 0.05, percentage: 5.0, baseAmount: fee.amount,
            status: pick(['PENDING', 'APPROVED', 'PAID']),
            metadata: { ruleName: 'Agent Commission' },
          },
        });
        commissionCount++;

        // Sub-broker commission (3.5%)
        const subBroker = brokers[1];
        await prisma.commission.create({
          data: {
            tenantId: school.id, brokerId: subBroker.id, paymentId: payment.id,
            amount: fee.amount * 0.035, percentage: 3.5, baseAmount: fee.amount,
            status: pick(['PENDING', 'APPROVED']),
            metadata: { ruleName: 'Sub-Broker Commission' },
          },
        });
        commissionCount++;

        // Top broker commission (2%)
        const topBroker = brokers[0];
        await prisma.commission.create({
          data: {
            tenantId: school.id, brokerId: topBroker.id, paymentId: payment.id,
            amount: fee.amount * 0.02, percentage: 2.0, baseAmount: fee.amount,
            status: 'APPROVED',
            metadata: { ruleName: 'Top Broker Commission' },
          },
        });
        commissionCount++;
      }
    }
  }
  console.log(`✅ Created ${paymentCount} payments and ${commissionCount} commissions\n`);

  // ========================================
  // ATTENDANCE (12 months of school days)
  // ========================================
  console.log('📋 Creating attendance records (12 months of school days)...');

  let attendanceCount = 0;
  const today = new Date();

  // Indian school holidays (approximate month-day ranges to skip)
  const holidays = [
    // Summer break: May 15 - Jun 30
    { startMonth: 4, startDay: 15, endMonth: 5, endDay: 30 },
    // Diwali break: ~Oct 25 - Nov 5
    { startMonth: 9, startDay: 25, endMonth: 10, endDay: 5 },
    // Winter break: Dec 25 - Jan 2
    { startMonth: 11, startDay: 25, endMonth: 0, endDay: 2 },
  ];

  function isHoliday(date: Date): boolean {
    const m = date.getMonth();
    const d = date.getDate();
    for (const h of holidays) {
      if (h.startMonth <= h.endMonth) {
        if (m >= h.startMonth && m <= h.endMonth) {
          if (m === h.startMonth && d < h.startDay) continue;
          if (m === h.endMonth && d > h.endDay) continue;
          return true;
        }
      } else {
        // Wraps around year (Dec-Jan)
        if ((m >= h.startMonth && d >= h.startDay) || (m <= h.endMonth && d <= h.endDay)) {
          return true;
        }
      }
    }
    return false;
  }

  for (let si = 0; si < schools.length; si++) {
    const school = schools[si];
    const students = allStudents[school.id];
    const classes = allClasses[school.id];
    const teacherUser = allUsers[school.id].teacher1;

    // Generate school days for the past 12 months
    const schoolDays: Date[] = [];
    const d = new Date(today);
    d.setFullYear(d.getFullYear() - 1); // Start from 1 year ago

    while (d <= today) {
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6 && !isHoliday(d)) {
        schoolDays.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }

    console.log(`  📅 ${school.name}: ${schoolDays.length} school days for ${students.length} students`);

    // Process in monthly batches
    const BATCH_SIZE = 500;
    let batch: any[] = [];

    for (const day of schoolDays) {
      for (const student of students) {
        const studentClass = classes.find((c: any) => c.gradeLevel === student.gradeLevel && c.section === student.section);
        if (!studentClass) continue;

        // Attendance varies by month (lower in winter, exam time)
        const month = day.getMonth();
        let presentRate = 0.88; // default 88%
        if (month === 0 || month === 11) presentRate = 0.82; // Winter: lower
        if (month === 2 || month === 8) presentRate = 0.92; // Exam months: higher
        if (month === 6) presentRate = 0.78; // July (monsoon): lowest

        const rand = Math.random();
        let status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
        if (rand < presentRate) status = 'PRESENT';
        else if (rand < presentRate + 0.07) status = 'ABSENT';
        else if (rand < presentRate + 0.10) status = 'LATE';
        else status = 'EXCUSED';

        batch.push({
          studentId: student.id,
          classId: studentClass.id,
          tenantId: school.id,
          date: day,
          status,
          markedBy: teacherUser.id,
          notes: status === 'ABSENT' ? pick(['Sick leave', 'Family emergency', 'Not informed', '']) : (status === 'LATE' ? pick(['Traffic', 'Bus late', '']) : undefined),
        });

        if (batch.length >= BATCH_SIZE) {
          await prisma.attendance.createMany({ data: batch, skipDuplicates: true });
          attendanceCount += batch.length;
          batch = [];
        }
      }
    }

    // Flush remaining
    if (batch.length > 0) {
      await prisma.attendance.createMany({ data: batch, skipDuplicates: true });
      attendanceCount += batch.length;
    }
  }
  console.log(`✅ Created ${attendanceCount} attendance records (12 months)\n`);

  // ========================================
  // NOTIFICATIONS (mix of types)
  // ========================================
  console.log('🔔 Creating notifications...');

  let notifCount = 0;
  for (let si = 0; si < schools.length; si++) {
    const school = schools[si];
    const admin = allUsers[school.id].admin;

    const notifications = [
      { type: 'STATIC' as const, title: 'Summer Break Notice', message: 'School will remain closed from May 15 to June 30, 2025 for summer vacation. Classes resume July 1.', targetRole: ['STUDENT', 'PARENT', 'TEACHER'], priority: 'MEDIUM' as const },
      { type: 'STATIC' as const, title: 'Annual Day Celebration', message: 'Annual day celebrations will be held on April 20, 2025. All parents are cordially invited. Cultural programs start at 4 PM.', targetRole: ['STUDENT', 'PARENT', 'TEACHER'], priority: 'LOW' as const },
      { type: 'DYNAMIC' as const, title: 'Fee Payment Reminder', message: 'This is a reminder that tuition fees for the academic year 2025-26 are due by June 1, 2025. Please make the payment at the earliest to avoid late fees.', targetRole: ['STUDENT', 'PARENT'], priority: 'HIGH' as const },
      { type: 'DYNAMIC' as const, title: 'Mid-Term Exam Schedule Released', message: 'The mid-term examination schedule for September 2025 has been uploaded. Students can check the timetable on the portal.', targetRole: ['STUDENT', 'TEACHER', 'PARENT'], priority: 'HIGH' as const },
      { type: 'ALERT' as const, title: 'School Closed Tomorrow - Heavy Rain Warning', message: 'Due to heavy rain forecast by IMD, school will remain closed tomorrow. Stay safe and avoid unnecessary travel.', targetRole: ['STUDENT', 'PARENT', 'TEACHER', 'ADMIN'], priority: 'URGENT' as const },
      { type: 'ANNOUNCEMENT' as const, title: 'New Computer Lab Inaugurated', message: 'We are excited to announce the opening of our new state-of-the-art computer lab with 50 workstations. Classes will begin next week.', targetRole: ['STUDENT', 'TEACHER'], priority: 'MEDIUM' as const },
      { type: 'DYNAMIC' as const, title: 'Parent-Teacher Meeting', message: 'PTM for all classes will be held on the first Saturday of next month. Parents are requested to attend without fail.', targetRole: ['PARENT', 'TEACHER'], priority: 'HIGH' as const },
      { type: 'STATIC' as const, title: 'Republic Day Celebration', message: 'Republic Day will be celebrated on January 26. Flag hoisting at 8 AM followed by cultural program. Attendance mandatory for all students.', targetRole: ['STUDENT', 'TEACHER'], priority: 'MEDIUM' as const },
    ];

    for (const notif of notifications) {
      await prisma.notification.create({
        data: {
          tenantId: school.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          targetRole: notif.targetRole,
          targetUsers: [],
          priority: notif.priority,
          delivered: Math.random() > 0.3,
          readBy: [],
          createdBy: admin.id,
        },
      });
      notifCount++;
    }
  }
  console.log(`✅ Created ${notifCount} notifications\n`);

  // ========================================
  // AUDIT LOGS (recent activity)
  // ========================================
  console.log('📝 Creating audit logs...');

  let auditCount = 0;
  for (let si = 0; si < schools.length; si++) {
    const school = schools[si];
    const admin = allUsers[school.id].admin;
    const students = allStudents[school.id];

    const auditEntries = [
      { action: 'LOGIN', resource: 'USER', resourceId: admin.id },
      ...students.slice(0, 5).map((s: any) => ({ action: 'CREATE', resource: 'STUDENT', resourceId: s.id })),
      ...students.slice(0, 3).map((s: any) => ({ action: 'UPDATE', resource: 'STUDENT', resourceId: s.id })),
      { action: 'CREATE', resource: 'FEE', resourceId: allFees[school.id][0]?.id || 'unknown' },
      { action: 'CREATE', resource: 'NOTIFICATION', resourceId: 'batch' },
    ];

    for (const entry of auditEntries) {
      await prisma.auditLog.create({
        data: {
          tenantId: school.id,
          userId: admin.id,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          metadata: { source: 'seed' },
          ipAddress: '127.0.0.1',
          userAgent: 'Seed Script/1.0',
        },
      });
      auditCount++;
    }
  }
  console.log(`✅ Created ${auditCount} audit log entries\n`);

  // ========================================
  // MESSAGES (sample messages)
  // ========================================
  console.log('✉️ Creating messages...');

  let msgCount = 0;
  for (let si = 0; si < schools.length; si++) {
    const school = schools[si];
    const admin = allUsers[school.id].admin;
    const students = allStudents[school.id];

    const messages = [
      { subject: 'Welcome to the new academic year', body: 'Dear Student, Welcome to the academic year 2025-26. We wish you a successful year ahead.', studentId: students[0]?.id },
      { subject: 'Fee payment confirmation', body: 'Your tuition fee payment has been received successfully. Thank you for the timely payment.', studentId: students[1]?.id },
      { subject: 'Attendance Warning', body: 'Your attendance has dropped below 75%. Please ensure regular attendance to avoid academic penalties.', studentId: students[5]?.id },
      { subject: 'Scholarship Application', body: 'Congratulations! You are eligible to apply for the merit scholarship. Please submit your application by the end of this month.', studentId: students[2]?.id },
      { subject: 'Sports Day Registration', body: 'Sports day is approaching. Please register for events by filling the form on the portal.', studentId: null },
    ];

    for (const msg of messages) {
      if (msg.studentId) {
        await prisma.message.create({
          data: {
            tenantId: school.id,
            senderId: admin.id,
            studentId: msg.studentId,
            subject: msg.subject,
            body: msg.body,
            isRead: Math.random() > 0.5,
          },
        });
        msgCount++;
      }
    }
  }
  console.log(`✅ Created ${msgCount} messages\n`);

  // ========================================
  // SUMMARY
  // ========================================
  const totalStudents = Object.values(allStudents).flat().length;
  const totalFees = Object.values(allFees).flat().length;

  console.log('═══════════════════════════════════════════════');
  console.log('✨ SEED COMPLETED SUCCESSFULLY!');
  console.log('═══════════════════════════════════════════════');
  console.log('\n📊 Summary:');
  console.log(`  Schools (Tenants):    3`);
  console.log(`  Brokers & Agents:     ${Object.values(allBrokers).flat().length}`);
  console.log(`  Commission Rules:     ${Object.values(allBrokers).flat().length * 1}`);
  console.log(`  Users:                ${Object.values(allUsers).reduce((sum, u) => sum + Object.keys(u).length, 0)}`);
  console.log(`  Parent Profiles:      ${Object.values(allParentProfiles).flat().length}`);
  console.log(`  Teachers:             ${Object.values(allTeachers).flat().length}`);
  console.log(`  Classes:              ${Object.values(allClasses).flat().length}`);
  console.log(`  Students:             ${totalStudents}`);
  console.log(`  Fees:                 ${totalFees}`);
  console.log(`  Payments:             ${paymentCount}`);
  console.log(`  Commissions:          ${commissionCount}`);
  console.log(`  Attendance Records:   ${attendanceCount}`);
  console.log(`  Notifications:        ${notifCount}`);
  console.log(`  Audit Logs:           ${auditCount}`);
  console.log(`  Messages:             ${msgCount}`);

  console.log('\n🔐 LOGIN CREDENTIALS (password same for all roles):');
  console.log('');
  console.log('  ┌─────────────────────────────────────────────────────────────────┐');
  console.log('  │ SCHOOL 1: Vidyamandir Classes (localhost:3003)                  │');
  console.log('  │   Super Admin : superadmin@vidyamandir.com / super123           │');
  console.log('  │   Admin       : admin@vidyamandir.com      / admin123           │');
  console.log('  │   Teacher     : teacher1@vidyamandir.com   / teacher123         │');
  console.log('  │   Broker      : broker@vidyamandir.com     / broker123          │');
  console.log('  │   Parent      : parent1@vidyamandir.com    / parent123          │');
  console.log('  ├─────────────────────────────────────────────────────────────────┤');
  console.log('  │ SCHOOL 2: Delhi Public School (dps.localhost)                   │');
  console.log('  │   Admin       : admin@dps.edu.in           / admin123           │');
  console.log('  │   Teacher     : teacher1@dps.edu.in        / teacher123         │');
  console.log('  │   Parent      : parent1@dps.edu.in         / parent123          │');
  console.log('  ├─────────────────────────────────────────────────────────────────┤');
  console.log('  │ SCHOOL 3: Sunrise Global Academy (sunrise.localhost)            │');
  console.log('  │   Admin       : admin@sunriseglobal.com    / admin123           │');
  console.log('  │   Teacher     : teacher1@sunriseglobal.com / teacher123         │');
  console.log('  │   Broker      : broker@sunriseglobal.com   / broker123          │');
  console.log('  │   Parent      : parent1@sunriseglobal.com  / parent123          │');
  console.log('  └─────────────────────────────────────────────────────────────────┘');
  console.log('');
  console.log('  🌐 Access: http://localhost:3003');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

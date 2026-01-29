import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password helper
  const hashPassword = async (password: string) => {
    return bcrypt.hash(password, 12);
  };

  // ============ TENANTS ============
  console.log('📦 Creating tenants...');

  const vidyamandirTenant = await prisma.tenant.upsert({
    where: { subdomain: 'portal.vidyamandir' },
    update: { primaryDomain: 'localhost:3000' }, // For local development (mobile app)
    create: {
      name: 'Vidyamandir Classes',
      primaryDomain: 'localhost:3000', // For local development (mobile app)
      subdomain: 'portal.vidyamandir',
      theme: {
        logo: 'https://vidyamandir.com/logo.svg',
        colors: {
          primary: 'hsl(221 83% 53%)',
          secondary: 'hsl(210 40% 96.1%)',
          accent: 'hsl(210 40% 96.1%)',
          background: 'hsl(0 0% 100%)',
          foreground: 'hsl(222.2 84% 4.9%)',
          muted: 'hsl(210 40% 96.1%)',
          mutedForeground: 'hsl(215.4 16.3% 46.9%)',
          border: 'hsl(214.3 31.8% 91.4%)',
        },
        fonts: {
          heading: 'Poppins, sans-serif',
          body: 'Inter, sans-serif',
        },
      },
      config: {
        features: {
          attendance: true,
          fees: true,
          messaging: true,
          commission: true,
          reports: true,
        },
        locale: 'en-IN',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
      },
      isActive: true,
    },
  });

  const demoTenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo School',
      primaryDomain: 'demo.school-crm.com',
      subdomain: 'demo',
      theme: {
        logo: '/demo-logo.svg',
        colors: {
          primary: 'hsl(142 76% 36%)',
          secondary: 'hsl(210 40% 96.1%)',
          accent: 'hsl(210 40% 96.1%)',
          background: 'hsl(0 0% 100%)',
          foreground: 'hsl(222.2 84% 4.9%)',
          muted: 'hsl(210 40% 96.1%)',
          mutedForeground: 'hsl(215.4 16.3% 46.9%)',
          border: 'hsl(214.3 31.8% 91.4%)',
        },
        fonts: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif',
        },
      },
      config: {
        features: {
          attendance: true,
          fees: true,
          messaging: false,
          commission: false,
          reports: true,
        },
        locale: 'en-US',
        timezone: 'America/New_York',
        currency: 'USD',
      },
      isActive: true,
    },
  });

  console.log(`✅ Created tenants: ${vidyamandirTenant.name}, ${demoTenant.name}`);

  // ============ BROKERS (Vidyamandir only) ============
  console.log('🏢 Creating broker hierarchy...');

  const topBroker = await prisma.broker.upsert({
    where: { code_tenantId: { code: 'BRK-001', tenantId: vidyamandirTenant.id } },
    update: {},
    create: {
      name: 'Master Broker Agency',
      code: 'BRK-001',
      tenantId: vidyamandirTenant.id,
      level: 0,
      metadata: { region: 'North India' },
      isActive: true,
    },
  });

  const subBroker1 = await prisma.broker.upsert({
    where: { code_tenantId: { code: 'BRK-002', tenantId: vidyamandirTenant.id } },
    update: {},
    create: {
      name: 'Delhi Sub-Broker',
      code: 'BRK-002',
      parentBrokerId: topBroker.id,
      tenantId: vidyamandirTenant.id,
      level: 1,
      metadata: { region: 'Delhi NCR' },
      isActive: true,
    },
  });

  const subBroker2 = await prisma.broker.upsert({
    where: { code_tenantId: { code: 'BRK-003', tenantId: vidyamandirTenant.id } },
    update: {},
    create: {
      name: 'Mumbai Sub-Broker',
      code: 'BRK-003',
      parentBrokerId: topBroker.id,
      tenantId: vidyamandirTenant.id,
      level: 1,
      metadata: { region: 'Mumbai' },
      isActive: true,
    },
  });

  const agent1 = await prisma.broker.upsert({
    where: { code_tenantId: { code: 'AGT-001', tenantId: vidyamandirTenant.id } },
    update: {},
    create: {
      name: 'Agent Raj Kumar',
      code: 'AGT-001',
      parentBrokerId: subBroker1.id,
      tenantId: vidyamandirTenant.id,
      level: 2,
      metadata: { phone: '+91-9876543210' },
      isActive: true,
    },
  });

  console.log(`✅ Created ${4} brokers/agents`);

  // ============ COMMISSION RULES ============
  console.log('💰 Creating commission rules...');

  await prisma.commissionRule.create({
    data: {
      brokerId: topBroker.id,
      name: 'Top Broker - All Fees',
      level: 0,
      percentage: 2.0,
      conditions: {
        minAmount: 0,
        feeType: ['TUITION', 'ADMISSION', 'EXAM'],
      },
      priority: 1,
      isActive: true,
    },
  });

  await prisma.commissionRule.create({
    data: {
      brokerId: subBroker1.id,
      name: 'Sub-Broker - Tuition Only',
      level: 1,
      percentage: 3.5,
      conditions: {
        minAmount: 10000,
        feeType: ['TUITION'],
      },
      priority: 2,
      isActive: true,
    },
  });

  await prisma.commissionRule.create({
    data: {
      brokerId: agent1.id,
      name: 'Agent - High Value',
      level: 2,
      percentage: 5.0,
      conditions: {
        minAmount: 50000,
      },
      priority: 3,
      isActive: true,
    },
  });

  console.log(`✅ Created commission rules`);

  // ============ USERS ============
  console.log('👥 Creating users...');

  const adminUser = await prisma.user.upsert({
    where: { email_tenantId: { email: 'admin@vidyamandir.com', tenantId: vidyamandirTenant.id } },
    update: {},
    create: {
      email: 'admin@vidyamandir.com',
      passwordHash: await hashPassword('admin123'),
      role: 'ADMIN',
      tenantId: vidyamandirTenant.id,
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        phone: '+91-9876543210',
      },
      isActive: true,
    },
  });

  const brokerUser = await prisma.user.upsert({
    where: { email_tenantId: { email: 'broker@vidyamandir.com', tenantId: vidyamandirTenant.id } },
    update: {},
    create: {
      email: 'broker@vidyamandir.com',
      passwordHash: await hashPassword('broker123'),
      role: 'BROKER',
      tenantId: vidyamandirTenant.id,
      brokerId: topBroker.id,
      profile: {
        firstName: 'Master',
        lastName: 'Broker',
        phone: '+91-9876543211',
      },
      isActive: true,
    },
  });

  const teacherUser = await prisma.user.upsert({
    where: { email_tenantId: { email: 'teacher@vidyamandir.com', tenantId: vidyamandirTenant.id } },
    update: {},
    create: {
      email: 'teacher@vidyamandir.com',
      passwordHash: await hashPassword('teacher123'),
      role: 'TEACHER',
      tenantId: vidyamandirTenant.id,
      profile: {
        firstName: 'Priya',
        lastName: 'Sharma',
        phone: '+91-9876543212',
      },
      isActive: true,
    },
  });

  // Demo tenant admin
  await prisma.user.upsert({
    where: { email_tenantId: { email: 'admin@demo.com', tenantId: demoTenant.id } },
    update: {},
    create: {
      email: 'admin@demo.com',
      passwordHash: await hashPassword('demo123'),
      role: 'ADMIN',
      tenantId: demoTenant.id,
      profile: {
        firstName: 'Demo',
        lastName: 'Admin',
      },
      isActive: true,
    },
  });

  console.log(`✅ Created users`);

  // ============ TEACHERS ============
  console.log('👨‍🏫 Creating teachers...');

  const teacher1 = await prisma.teacher.upsert({
    where: { email_tenantId: { email: 'priya.sharma@vidyamandir.com', tenantId: vidyamandirTenant.id } },
    update: {},
    create: {
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@vidyamandir.com',
      phone: '+91-9876543212',
      tenantId: vidyamandirTenant.id,
      subject: 'Mathematics',
      metadata: { qualification: 'M.Sc Mathematics' },
      isActive: true,
    },
  });

  const teacher2 = await prisma.teacher.upsert({
    where: { email_tenantId: { email: 'amit.verma@vidyamandir.com', tenantId: vidyamandirTenant.id } },
    update: {},
    create: {
      firstName: 'Amit',
      lastName: 'Verma',
      email: 'amit.verma@vidyamandir.com',
      phone: '+91-9876543213',
      tenantId: vidyamandirTenant.id,
      subject: 'Physics',
      metadata: { qualification: 'M.Sc Physics' },
      isActive: true,
    },
  });

  console.log(`✅ Created teachers`);

  // ============ CLASSES ============
  console.log('🎓 Creating classes...');

  const class12A = await prisma.class.create({
    data: {
      name: 'Class 12-A',
      gradeLevel: '12',
      section: 'A',
      tenantId: vidyamandirTenant.id,
      teacherId: teacher1.id,
      schedule: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '10:00', subject: 'Mathematics' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '10:00', subject: 'Mathematics' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '10:00', subject: 'Mathematics' },
      ],
      isActive: true,
    },
  });

  const class11B = await prisma.class.create({
    data: {
      name: 'Class 11-B',
      gradeLevel: '11',
      section: 'B',
      tenantId: vidyamandirTenant.id,
      teacherId: teacher2.id,
      schedule: [
        { dayOfWeek: 2, startTime: '10:00', endTime: '11:00', subject: 'Physics' },
        { dayOfWeek: 4, startTime: '10:00', endTime: '11:00', subject: 'Physics' },
      ],
      isActive: true,
    },
  });

  console.log(`✅ Created classes`);

  // ============ STUDENTS ============
  console.log('👨‍🎓 Creating students...');

  const student1 = await prisma.student.upsert({
    where: { enrollmentNumber_tenantId: { enrollmentNumber: 'VM2024001', tenantId: vidyamandirTenant.id } },
    update: {},
    create: {
      firstName: 'Rahul',
      lastName: 'Gupta',
      email: 'rahul.gupta@example.com',
      phone: '+91-9876543220',
      tenantId: vidyamandirTenant.id,
      brokerId: agent1.id, // Enrolled by agent
      enrollmentNumber: 'VM2024001',
      gradeLevel: '12',
      section: 'A',
      metadata: { parentName: 'Mr. Gupta', parentPhone: '+91-9876543221' },
      isActive: true,
    },
  });

  const student2 = await prisma.student.upsert({
    where: { enrollmentNumber_tenantId: { enrollmentNumber: 'VM2024002', tenantId: vidyamandirTenant.id } },
    update: {},
    create: {
      firstName: 'Sneha',
      lastName: 'Patel',
      email: 'sneha.patel@example.com',
      phone: '+91-9876543222',
      tenantId: vidyamandirTenant.id,
      brokerId: agent1.id,
      enrollmentNumber: 'VM2024002',
      gradeLevel: '12',
      section: 'A',
      metadata: { parentName: 'Mrs. Patel', parentPhone: '+91-9876543223' },
      isActive: true,
    },
  });

  const student3 = await prisma.student.upsert({
    where: { enrollmentNumber_tenantId: { enrollmentNumber: 'VM2024003', tenantId: vidyamandirTenant.id } },
    update: {},
    create: {
      firstName: 'Arjun',
      lastName: 'Singh',
      email: 'arjun.singh@example.com',
      tenantId: vidyamandirTenant.id,
      brokerId: subBroker1.id,
      enrollmentNumber: 'VM2024003',
      gradeLevel: '11',
      section: 'B',
      metadata: { parentName: 'Mr. Singh' },
      isActive: true,
    },
  });

  console.log(`✅ Created students`);

  // ============ FEES ============
  console.log('💵 Creating fees...');

  const fee1 = await prisma.fee.create({
    data: {
      studentId: student1.id,
      tenantId: vidyamandirTenant.id,
      type: 'TUITION',
      amount: 50000,
      dueDate: new Date('2024-06-01'),
      status: 'PAID',
      description: 'Annual Tuition Fee 2024',
      academicYear: '2024-2025',
    },
  });

  const fee2 = await prisma.fee.create({
    data: {
      studentId: student2.id,
      tenantId: vidyamandirTenant.id,
      type: 'ADMISSION',
      amount: 25000,
      dueDate: new Date('2024-04-15'),
      status: 'PAID',
      description: 'Admission Fee',
      academicYear: '2024-2025',
    },
  });

  const fee3 = await prisma.fee.create({
    data: {
      studentId: student3.id,
      tenantId: vidyamandirTenant.id,
      type: 'TUITION',
      amount: 45000,
      dueDate: new Date('2024-07-01'),
      status: 'PENDING',
      description: 'Annual Tuition Fee 2024',
      academicYear: '2024-2025',
    },
  });

  console.log(`✅ Created fees`);

  // ============ PAYMENTS & COMMISSIONS ============
  console.log('💳 Creating payments and commissions...');

  const payment1 = await prisma.payment.create({
    data: {
      feeId: fee1.id,
      studentId: student1.id,
      tenantId: vidyamandirTenant.id,
      amount: 50000,
      paymentMethod: 'UPI',
      transactionId: 'TXN-2024-001',
      status: 'COMPLETED',
      paidAt: new Date('2024-06-01'),
      metadata: { upiId: 'student@paytm' },
    },
  });

  const payment2 = await prisma.payment.create({
    data: {
      feeId: fee2.id,
      studentId: student2.id,
      tenantId: vidyamandirTenant.id,
      amount: 25000,
      paymentMethod: 'CARD',
      transactionId: 'TXN-2024-002',
      status: 'COMPLETED',
      paidAt: new Date('2024-04-15'),
      metadata: { cardLast4: '4242' },
    },
  });

  // Create commissions for payments
  // Agent commission (5% on 50000 = 2500)
  await prisma.commission.create({
    data: {
      tenantId: vidyamandirTenant.id,
      brokerId: agent1.id,
      paymentId: payment1.id,
      amount: 2500,
      percentage: 5.0,
      baseAmount: 50000,
      status: 'APPROVED',
      metadata: { ruleName: 'Agent - High Value' },
    },
  });

  // Sub-broker commission (3.5% on 50000 = 1750)
  await prisma.commission.create({
    data: {
      tenantId: vidyamandirTenant.id,
      brokerId: subBroker1.id,
      paymentId: payment1.id,
      amount: 1750,
      percentage: 3.5,
      baseAmount: 50000,
      status: 'APPROVED',
      metadata: { ruleName: 'Sub-Broker - Tuition Only' },
    },
  });

  // Top broker commission (2% on 50000 = 1000)
  await prisma.commission.create({
    data: {
      tenantId: vidyamandirTenant.id,
      brokerId: topBroker.id,
      paymentId: payment1.id,
      amount: 1000,
      percentage: 2.0,
      baseAmount: 50000,
      status: 'APPROVED',
      metadata: { ruleName: 'Top Broker - All Fees' },
    },
  });

  console.log(`✅ Created payments and commissions`);

  // ============ ATTENDANCE ============
  console.log('📋 Creating attendance records...');

  const today = new Date();
  await prisma.attendance.create({
    data: {
      studentId: student1.id,
      classId: class12A.id,
      tenantId: vidyamandirTenant.id,
      date: today,
      status: 'PRESENT',
      markedBy: teacherUser.id,
    },
  });

  await prisma.attendance.create({
    data: {
      studentId: student2.id,
      classId: class12A.id,
      tenantId: vidyamandirTenant.id,
      date: today,
      status: 'PRESENT',
      markedBy: teacherUser.id,
    },
  });

  console.log(`✅ Created attendance records`);

  console.log('\n✨ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`  - Tenants: 2 (Vidyamandir Classes, Demo School)`);
  console.log(`  - Brokers: 4 (1 top broker, 2 sub-brokers, 1 agent)`);
  console.log(`  - Users: 4`);
  console.log(`  - Students: 3`);
  console.log(`  - Teachers: 2`);
  console.log(`  - Classes: 2`);
  console.log(`  - Fees: 3`);
  console.log(`  - Payments: 2`);
  console.log(`  - Commissions: 3`);
  console.log(`  - Attendance: 2`);
  console.log('\n🔐 Login credentials:');
  console.log('  Vidyamandir Admin: admin@vidyamandir.com / admin123');
  console.log('  Vidyamandir Broker: broker@vidyamandir.com / broker123');
  console.log('  Vidyamandir Teacher: teacher@vidyamandir.com / teacher123');
  console.log('  Demo Admin: admin@demo.com / demo123');
  console.log('\n🌐 Development:');
  console.log('  Access at: http://localhost:3003');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

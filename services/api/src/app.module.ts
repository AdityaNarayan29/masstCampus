import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { TenantModule } from './tenant/tenant.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BrokersModule } from './brokers/brokers.module';
import { StudentsModule } from './students/students.module';
import { FeesModule } from './fees/fees.module';
import { CommissionModule } from './commission/commission.module';
import { AttendanceModule } from './attendance/attendance.module';
import { TeachersModule } from './teachers/teachers.module';
import { ParentsModule } from './parents/parents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ClassesModule } from './classes/classes.module';
import { TenantInterceptor } from './tenant/tenant.interceptor';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    TenantModule,
    AuthModule,
    UsersModule,
    BrokersModule,
    StudentsModule,
    FeesModule,
    CommissionModule,
    AttendanceModule,
    TeachersModule,
    ParentsModule,
    NotificationsModule,
    ClassesModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

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
import { TenantInterceptor } from './tenant/tenant.interceptor';

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
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
  ],
})
export class AppModule {}

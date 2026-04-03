-- AlterTable
ALTER TABLE "tenants" ADD COLUMN "board" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "state" TEXT,
ADD COLUMN "onboardingStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "onboardingComplete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "smsOptOut" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "smsOptOutAt" TIMESTAMP(3);

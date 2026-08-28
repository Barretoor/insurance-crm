-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'UNDELIVERED', 'FAILED', 'RECEIVED');

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "twilioMessageSid" TEXT,
    "direction" "MessageDirection" NOT NULL,
    "body" TEXT NOT NULL,
    "fromNumber" TEXT NOT NULL,
    "toNumber" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'QUEUED',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agencyId" TEXT NOT NULL,
    "contactId" TEXT,
    "userId" TEXT,
    "phoneNumberId" TEXT,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "messages_twilioMessageSid_key" ON "messages"("twilioMessageSid");

-- CreateIndex
CREATE INDEX "messages_agencyId_read_idx" ON "messages"("agencyId", "read");

-- CreateIndex
CREATE INDEX "messages_contactId_createdAt_idx" ON "messages"("contactId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_phoneNumberId_idx" ON "messages"("phoneNumberId");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_phoneNumberId_fkey" FOREIGN KEY ("phoneNumberId") REFERENCES "phone_numbers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

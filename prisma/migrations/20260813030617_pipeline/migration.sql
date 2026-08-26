-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "stageId" TEXT;

-- CreateTable
CREATE TABLE "pipeline_stages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agencyId" TEXT NOT NULL,

    CONSTRAINT "pipeline_stages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pipeline_stages_agencyId_order_idx" ON "pipeline_stages"("agencyId", "order");

-- CreateIndex
CREATE INDEX "contacts_stageId_idx" ON "contacts"("stageId");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "pipeline_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: seed the 6 default pipeline stages for every agency that existed
-- before this migration (new agencies get these seeded by the app at signup).
INSERT INTO "pipeline_stages" ("id", "agencyId", "name", "order", "color", "updatedAt")
SELECT gen_random_uuid()::text, a."id", s.name, s."order", s.color, CURRENT_TIMESTAMP
FROM "agencies" a
CROSS JOIN (
    VALUES
        ('Nuevo lead', 0, '#3B82F6'),
        ('Contactado', 1, '#6366F1'),
        ('Cotización enviada', 2, '#F59E0B'),
        ('En negociación', 3, '#8B5CF6'),
        ('Póliza emitida', 4, '#10B981'),
        ('Perdido', 5, '#6B7280')
) AS s(name, "order", color);

-- Backfill: put every pre-existing contact with no stage yet into its
-- agency's first stage ("Nuevo lead", order 0).
UPDATE "contacts" c
SET "stageId" = ps."id"
FROM "pipeline_stages" ps
WHERE ps."agencyId" = c."agencyId"
  AND ps."order" = 0
  AND c."stageId" IS NULL;

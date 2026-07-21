-- Persist all data managed by the dashboard frontend.
ALTER TABLE "Fund" ADD COLUMN "origin" TEXT NOT NULL DEFAULT 'APPROVED';
ALTER TABLE "Fund" ADD COLUMN "benchmark" TEXT;
ALTER TABLE "Fund" ADD COLUMN "liquidity" TEXT;
ALTER TABLE "Fund" ADD COLUMN "taxation" TEXT;
ALTER TABLE "Fund" ADD COLUMN "data" TEXT;
ALTER TABLE "Fund" ADD COLUMN "recommended" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Fund" ADD COLUMN "quantitativeRating" REAL;
ALTER TABLE "Fund" ADD COLUMN "finalRating" REAL;
ALTER TABLE "Fund" ADD COLUMN "notes" TEXT;
ALTER TABLE "Fund" ADD COLUMN "color" TEXT;

CREATE TABLE "Index" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "ret" REAL,
  "vol" REAL,
  "updatedAt" DATETIME NOT NULL,
  "color" TEXT,
  "dashed" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE "Comparison" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
  "refId" TEXT,
  "selected" JSONB NOT NULL,
  "title" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "correlations" JSONB NOT NULL,
  "updatedAt" DATETIME NOT NULL
);

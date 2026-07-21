-- CreateTable
CREATE TABLE "Fund" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fundRegistrationNumber" TEXT,
    "managerName" TEXT,
    "managerRegistrationNumber" TEXT,
    "anbimaCategory" TEXT,
    "netAssetsBillions" REAL,
    "investorCount" INTEGER,
    "trailingTwelveMonthsReturn" REAL,
    "sharePrice" REAL,
    "sharePriceDate" DATETIME,
    "domicile" TEXT,
    "fundType" TEXT,
    "status" TEXT,
    "assetClass" TEXT,
    "subtype" TEXT,
    "annualizedReturnSinceInception" REAL,
    "annualizedVolatilitySinceInception" REAL,
    "validated" BOOLEAN,
    "lastImportedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Fund_classCode_key" ON "Fund"("classCode");

-- CreateIndex
CREATE INDEX "Fund_validated_idx" ON "Fund"("validated");

-- CreateIndex
CREATE INDEX "Fund_fundType_assetClass_subtype_idx" ON "Fund"("fundType", "assetClass", "subtype");

-- CreateIndex
CREATE INDEX "Fund_fundRegistrationNumber_idx" ON "Fund"("fundRegistrationNumber");

-- CreateIndex
CREATE INDEX "Fund_name_idx" ON "Fund"("name");

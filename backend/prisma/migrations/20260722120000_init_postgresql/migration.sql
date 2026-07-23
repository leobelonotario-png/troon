-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Domicile" AS ENUM ('ONSHORE', 'OFFSHORE');

-- CreateEnum
CREATE TYPE "FundOrigin" AS ENUM ('APPROVED', 'INDUSTRY');

-- CreateEnum
CREATE TYPE "FundType" AS ENUM ('LIQUID', 'ILLIQUID', 'LISTED');

-- CreateEnum
CREATE TYPE "FundStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "AssetClass" AS ENUM ('FLOATING_RATE', 'SHORT_DURATION', 'LONG_DURATION', 'HEDGE_FUNDS', 'EQUITIES', 'ALTERNATIVES', 'FII_BRICK_AND_MORTAR', 'FII_PAPER', 'FII_HYBRID', 'FII_FOFS', 'ETF');

-- CreateEnum
CREATE TYPE "Subtype" AS ENUM ('OVERNIGHT', 'HIGH_GRADE', 'HIGH_YIELD', 'SD_SOVEREIGN', 'LD_SOVEREIGN', 'MACRO', 'MULTI_STRATEGY', 'LONG_AND_SHORT', 'LARGE_CAP_VALUE', 'MID_CAP_VALUE', 'SMALL_CAP_VALUE', 'LARGE_CAP_BLEND', 'MID_CAP_BLEND', 'SMALL_CAP_BLEND', 'LARGE_CAP_GROWTH', 'MID_CAP_GROWTH', 'SMALL_CAP_GROWTH', 'LONG_BIASED', 'SECONDARIES', 'STRUCTURED_CREDIT', 'SPECIAL_SITUATION', 'PRIVATE_EQUITY', 'GROWTH_CAPITAL', 'VENTURE_CAPITAL', 'PUBLIC_INFRASTRUCTURE', 'PUBLIC_REAL_ESTATE', 'GOLD', 'CURRENCY', 'CRYPTOCURRENCY', 'COMMODITIES', 'LOGISTICS', 'CORPORATE_OFFICES', 'SHOPPING', 'URBAN_INCOME', 'INDUSTRIAL', 'HOSPITALITY', 'RESIDENTIAL', 'AGRICULTURE', 'DEVELOPMENT', 'OTHER', 'HYBRID', 'FOF', 'EQUITIES', 'FIXED_INCOME_SECURITIES', 'FACTORS', 'SECTORAL', 'THEMATIC', 'ASSETS', 'DIGITAL_ASSETS');

-- CreateTable
CREATE TABLE "Fund" (
    "id" TEXT NOT NULL,
    "classCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "origin" "FundOrigin" NOT NULL DEFAULT 'APPROVED',
    "fundRegistrationNumber" TEXT,
    "managerName" TEXT,
    "managerRegistrationNumber" TEXT,
    "anbimaCategory" TEXT,
    "netAssetsBillions" DOUBLE PRECISION,
    "investorCount" INTEGER,
    "trailingTwelveMonthsReturn" DOUBLE PRECISION,
    "sharePrice" DOUBLE PRECISION,
    "sharePriceDate" TIMESTAMP(3),
    "domicile" "Domicile",
    "fundType" "FundType",
    "status" "FundStatus",
    "assetClass" "AssetClass",
    "subtype" "Subtype",
    "annualizedReturnSinceInception" DOUBLE PRECISION,
    "annualizedVolatilitySinceInception" DOUBLE PRECISION,
    "validated" BOOLEAN,
    "lastImportedAt" TIMESTAMP(3),
    "benchmark" TEXT,
    "liquidity" TEXT,
    "taxation" TEXT,
    "data" TEXT,
    "recommended" BOOLEAN NOT NULL DEFAULT false,
    "quantitativeRating" DOUBLE PRECISION,
    "finalRating" DOUBLE PRECISION,
    "notes" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Index" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ret" DOUBLE PRECISION,
    "vol" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "color" TEXT,
    "dashed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Index_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comparison" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "refId" TEXT,
    "selected" JSONB NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "correlations" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

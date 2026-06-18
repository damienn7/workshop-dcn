-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BuybackCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "articleType" TEXT NOT NULL,
    "category" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "frameSize" TEXT,
    "serialNumber" TEXT,
    "declaredKm" INTEGER,
    "estimatedBasePrice" INTEGER,
    "customerScore" INTEGER,
    "onlineEstimate" INTEGER,
    "finalOffer" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BuybackCase_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PreDiagnostic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "generalState" TEXT,
    "frame" TEXT,
    "brakes" TEXT,
    "transmission" TEXT,
    "wheels" TEXT,
    "photosJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PreDiagnostic_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "BuybackCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Diagnosis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "identificationJson" TEXT,
    "frameForkJson" TEXT,
    "brakesJson" TEXT,
    "transmissionJson" TEXT,
    "wheelsTiresJson" TEXT,
    "finishingJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Diagnosis_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "BuybackCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScoreResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "customerScore" INTEGER,
    "technicianScore" INTEGER NOT NULL,
    "decision" TEXT NOT NULL,
    "onlineEstimate" INTEGER,
    "finalOffer" INTEGER NOT NULL,
    "gapPercent" INTEGER,
    "categoryScoresJson" TEXT NOT NULL,
    "blockingReasonsJson" TEXT NOT NULL,
    "repairCostsJson" TEXT NOT NULL,
    "priceBreakdownJson" TEXT NOT NULL,
    "explanationsJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScoreResult_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "BuybackCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "finalOffer" INTEGER NOT NULL,
    "manualAdjustment" BOOLEAN NOT NULL DEFAULT false,
    "adjustmentReason" TEXT,
    "refusalReasonsJson" TEXT,
    "alternativesJson" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Decision_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "BuybackCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BuybackCase_caseNumber_key" ON "BuybackCase"("caseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PreDiagnostic_caseId_key" ON "PreDiagnostic"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "Diagnosis_caseId_key" ON "Diagnosis"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreResult_caseId_key" ON "ScoreResult"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "Decision_caseId_key" ON "Decision"("caseId");

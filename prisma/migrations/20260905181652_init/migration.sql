-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CITIZEN',
    "neighborhood" TEXT,
    "civicPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RoadReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "address" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "severity" TEXT,
    "confidenceScore" REAL,
    "boundingBoxCoverage" REAL,
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "crowdUrgency" TEXT NOT NULL DEFAULT 'LOW',
    "priorityScore" REAL,
    "priorityLevel" TEXT,
    "duplicateGroupId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "resolvedAt" DATETIME,
    CONSTRAINT "RoadReport_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RoadReport_duplicateGroupId_fkey" FOREIGN KEY ("duplicateGroupId") REFERENCES "DuplicateGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Detection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL DEFAULT 'YOLOv8-Mock',
    "confidence" REAL NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "width" REAL NOT NULL,
    "height" REAL NOT NULL,
    "imageWidth" REAL NOT NULL,
    "imageHeight" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Detection_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "RoadReport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DuplicateGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "primaryReportId" TEXT NOT NULL,
    "radiusMeters" REAL NOT NULL DEFAULT 10.0,
    "reportCount" INTEGER NOT NULL DEFAULT 1,
    "crowdUrgency" TEXT NOT NULL DEFAULT 'LOW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RepairAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "contractorName" TEXT NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RepairAssignment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "RoadReport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RepairVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "residualDefectDetected" BOOLEAN NOT NULL,
    "confidence" REAL NOT NULL,
    "completionScore" REAL NOT NULL,
    "auditStatus" TEXT NOT NULL,
    "verifiedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RepairVerification_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "RoadReport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipientId" TEXT NOT NULL,
    "reportId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Notification_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "RoadReport" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Upvote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Upvote_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "RoadReport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Upvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CivicPointTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "reportId" TEXT,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CivicPointTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CivicPointTransaction_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "RoadReport" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KnowledgeDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RoadReport_ticketId_key" ON "RoadReport"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "Detection_reportId_key" ON "Detection"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "DuplicateGroup_primaryReportId_key" ON "DuplicateGroup"("primaryReportId");

-- CreateIndex
CREATE UNIQUE INDEX "RepairAssignment_reportId_key" ON "RepairAssignment"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "RepairVerification_reportId_key" ON "RepairVerification"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "Upvote_reportId_userId_key" ON "Upvote"("reportId", "userId");

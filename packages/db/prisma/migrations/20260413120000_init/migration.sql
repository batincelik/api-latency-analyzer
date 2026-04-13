-- CreateEnum
CREATE TYPE "HttpMethod" AS ENUM ('GET', 'POST', 'PUT', 'PATCH', 'DELETE');

-- CreateEnum
CREATE TYPE "AlertRuleType" AS ENUM ('ENDPOINT_DOWN', 'REPEATED_FAILURES', 'LATENCY_THRESHOLD');

-- CreateEnum
CREATE TYPE "AlertEventStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateEnum
CREATE TYPE "CheckErrorClass" AS ENUM ('NONE', 'TIMEOUT', 'DNS', 'CONNECT', 'TLS', 'HTTP_STATUS', 'NETWORK', 'VALIDATION', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_REGISTER', 'USER_LOGIN', 'USER_LOGOUT', 'ENDPOINT_CREATE', 'ENDPOINT_UPDATE', 'ENDPOINT_DELETE', 'ALERT_FIRE', 'ALERT_RESOLVE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Endpoint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "url" TEXT NOT NULL,
    "method" "HttpMethod" NOT NULL DEFAULT 'GET',
    "timeoutMs" INTEGER NOT NULL DEFAULT 10000,
    "intervalSeconds" INTEGER NOT NULL DEFAULT 60,
    "body" TEXT,
    "expectedStatusCodes" INTEGER[] DEFAULT ARRAY[200]::INTEGER[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "archivedAt" TIMESTAMP(3),
    "nextCheckAt" TIMESTAMP(3),
    "lastCheckAt" TIMESTAMP(3),
    "lastStatusSuccess" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Endpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EndpointHeader" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EndpointHeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckResult" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "statusCode" INTEGER,
    "latencyMs" INTEGER,
    "dnsMs" INTEGER,
    "connectMs" INTEGER,
    "requestMs" INTEGER,
    "responseMs" INTEGER,
    "errorClass" "CheckErrorClass" NOT NULL DEFAULT 'NONE',
    "errorMessage" TEXT,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "maxAttempts" INTEGER NOT NULL DEFAULT 1,
    "firstError" TEXT,
    "jobId" TEXT,
    "correlationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertRule" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "type" "AlertRuleType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "cooldownSeconds" INTEGER NOT NULL DEFAULT 300,
    "failureThreshold" INTEGER,
    "latencyThresholdMs" INTEGER,
    "webhookUrl" TEXT,
    "lastFiredAt" TIMESTAMP(3),
    "lastDedupeKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertEvent" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "alertRuleId" TEXT NOT NULL,
    "status" "AlertEventStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "payload" JSONB,
    "firedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Session_refreshTokenHash_idx" ON "Session"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "Endpoint_userId_archivedAt_idx" ON "Endpoint"("userId", "archivedAt");

-- CreateIndex
CREATE INDEX "Endpoint_enabled_archivedAt_nextCheckAt_idx" ON "Endpoint"("enabled", "archivedAt", "nextCheckAt");

-- CreateIndex
CREATE INDEX "Endpoint_nextCheckAt_idx" ON "Endpoint"("nextCheckAt");

-- CreateIndex
CREATE INDEX "EndpointHeader_endpointId_idx" ON "EndpointHeader"("endpointId");

-- CreateIndex
CREATE UNIQUE INDEX "EndpointHeader_endpointId_key_key" ON "EndpointHeader"("endpointId", "key");

-- CreateIndex
CREATE INDEX "CheckResult_endpointId_createdAt_idx" ON "CheckResult"("endpointId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CheckResult_createdAt_idx" ON "CheckResult"("createdAt");

-- CreateIndex
CREATE INDEX "CheckResult_success_createdAt_idx" ON "CheckResult"("success", "createdAt");

-- CreateIndex
CREATE INDEX "AlertRule_endpointId_idx" ON "AlertRule"("endpointId");

-- CreateIndex
CREATE INDEX "AlertEvent_endpointId_firedAt_idx" ON "AlertEvent"("endpointId", "firedAt" DESC);

-- CreateIndex
CREATE INDEX "AlertEvent_status_firedAt_idx" ON "AlertEvent"("status", "firedAt");

-- CreateIndex
CREATE INDEX "AlertEvent_dedupeKey_idx" ON "AlertEvent"("dedupeKey");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endpoint" ADD CONSTRAINT "Endpoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EndpointHeader" ADD CONSTRAINT "EndpointHeader_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckResult" ADD CONSTRAINT "CheckResult_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_alertRuleId_fkey" FOREIGN KEY ("alertRuleId") REFERENCES "AlertRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

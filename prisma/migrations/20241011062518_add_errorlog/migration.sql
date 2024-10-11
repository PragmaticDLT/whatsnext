-- CreateEnum
CREATE TYPE "ErrorType" AS ENUM ('rate_limit_exceeded', 'failed');

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" SERIAL NOT NULL,
    "type" "ErrorType" NOT NULL DEFAULT 'failed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error" TEXT NOT NULL,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

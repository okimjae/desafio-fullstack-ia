-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('EM_ANALISE', 'APROVADO', 'EM_ANDAMENTO', 'ENCERRADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "ProjectRisk" AS ENUM ('BAIXO', 'MEDIO', 'ALTO');

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "budget" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'EM_ANALISE',
    "risk" "ProjectRisk" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

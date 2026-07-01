import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectRisk } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    const startDate = new Date(createProjectDto.startDate);
    const endDate = new Date(createProjectDto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('A data de previsão de término não pode ser anterior à data de início');
    }

    const risk = this.calculateRisk(createProjectDto.budget, startDate, endDate);

    return this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        startDate,
        endDate,
        budget: createProjectDto.budget,
        description: createProjectDto.description,
        risk,
      },
    });
  }

  async findAll() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Projeto com ID ${id} não encontrado`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const existing = await this.findOne(id);

    const finalStartDate = updateProjectDto.startDate ? new Date(updateProjectDto.startDate) : existing.startDate;
    const finalEndDate = updateProjectDto.endDate ? new Date(updateProjectDto.endDate) : existing.endDate;

    if (finalEndDate < finalStartDate) {
      throw new BadRequestException('A data de previsão de término não pode ser anterior à data de início');
    }

    const finalBudget = updateProjectDto.budget !== undefined ? updateProjectDto.budget : existing.budget.toNumber();

    let risk = existing.risk;
    if (
      updateProjectDto.startDate !== undefined ||
      updateProjectDto.endDate !== undefined ||
      updateProjectDto.budget !== undefined
    ) {
      risk = this.calculateRisk(finalBudget, finalStartDate, finalEndDate);
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        name: updateProjectDto.name,
        startDate: finalStartDate,
        endDate: finalEndDate,
        budget: finalBudget,
        description: updateProjectDto.description,
        risk,
      },
    });
  }

  async updateStatus(id: string, updateProjectStatusDto: UpdateProjectStatusDto) {
    await this.findOne(id);

    return this.prisma.project.update({
      where: { id },
      data: {
        status: updateProjectStatusDto.status,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.project.delete({
      where: { id },
    });
  }

  /**
   * Calcula o risco do projeto baseado no orçamento e no prazo.
   * Aplica a regra de prevalência do maior risco.
   */
  private calculateRisk(budget: number, startDate: Date, endDate: Date): ProjectRisk {
    const diffInMs = endDate.getTime() - startDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    const diffInMonths = diffInDays / 30;

    let budgetRisk: ProjectRisk;
    let durationRisk: ProjectRisk;

    // Classificação de risco por Orçamento
    if (budget <= 100000) {
      budgetRisk = ProjectRisk.BAIXO;
    } else if (budget <= 500000) {
      budgetRisk = ProjectRisk.MEDIO;
    } else {
      budgetRisk = ProjectRisk.ALTO;
    }

    // Classificação de risco por Prazo (duração)
    if (diffInMonths <= 3) {
      durationRisk = ProjectRisk.BAIXO;
    } else if (diffInMonths <= 6) {
      durationRisk = ProjectRisk.MEDIO;
    } else {
      durationRisk = ProjectRisk.ALTO;
    }

    // Regra de prevalência (retorna o maior risco)
    const riskLevels = {
      [ProjectRisk.BAIXO]: 1,
      [ProjectRisk.MEDIO]: 2,
      [ProjectRisk.ALTO]: 3,
    };

    return riskLevels[budgetRisk] >= riskLevels[durationRisk] ? budgetRisk : durationRisk;
  }
}

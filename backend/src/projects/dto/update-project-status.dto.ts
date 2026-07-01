import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class UpdateProjectStatusDto {
  @IsEnum(ProjectStatus, { message: 'Status do projeto inválido' })
  @IsNotEmpty({ message: 'O status do projeto é obrigatório' })
  status: ProjectStatus;
}

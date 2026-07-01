import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class UpdateProjectStatusDto {
  @ApiProperty({
    description: 'Novo status a ser atribuído ao projeto',
    enum: ProjectStatus,
    example: ProjectStatus.APROVADO,
  })
  @IsEnum(ProjectStatus, { message: 'Status do projeto inválido' })
  @IsNotEmpty({ message: 'O status do projeto é obrigatório' })
  status: ProjectStatus;
}

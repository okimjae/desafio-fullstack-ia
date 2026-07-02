import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsDateString,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Nome do projeto',
    example: 'E-commerce Plataforma Nova',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome do projeto é obrigatório' })
  @MinLength(3, {
    message: 'O nome do projeto deve ter no mínimo 3 caracteres',
  })
  name: string;

  @ApiProperty({
    description: 'Data de início do projeto (ISO 8601)',
    example: '2026-07-01T00:00:00Z',
  })
  @IsDateString(
    {},
    { message: 'A data de início deve ser uma data válida no formato ISO' },
  )
  @IsNotEmpty({ message: 'A data de início é obrigatória' })
  startDate: string;

  @ApiProperty({
    description: 'Previsão de término do projeto (ISO 8601)',
    example: '2026-09-01T00:00:00Z',
  })
  @IsDateString(
    {},
    {
      message:
        'A data de previsão de término deve ser uma data válida no formato ISO',
    },
  )
  @IsNotEmpty({ message: 'A data de previsão de término é obrigatória' })
  endDate: string;

  @ApiProperty({
    description: 'Orçamento alocado para o projeto em R$',
    example: 80000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'O orçamento total deve ser um número válido' })
  @Min(0, { message: 'O orçamento total não pode ser negativo' })
  @IsNotEmpty({ message: 'O orçamento total é obrigatório' })
  budget: number;

  @ApiProperty({
    description: 'Descrição curta ou observações do projeto',
    example: 'Desenvolvimento do novo portal corporativo.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

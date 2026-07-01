import { IsNotEmpty, IsString, MinLength, IsDateString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do projeto é obrigatório' })
  @MinLength(3, { message: 'O nome do projeto deve ter no mínimo 3 caracteres' })
  name: string;

  @IsDateString({}, { message: 'A data de início deve ser uma data válida no formato ISO' })
  @IsNotEmpty({ message: 'A data de início é obrigatória' })
  startDate: string;

  @IsDateString({}, { message: 'A data de previsão de término deve ser uma data válida no formato ISO' })
  @IsNotEmpty({ message: 'A data de previsão de término é obrigatória' })
  endDate: string;

  @IsNumber({}, { message: 'O orçamento total deve ser um número válido' })
  @Min(0, { message: 'O orçamento total não pode ser negativo' })
  @IsNotEmpty({ message: 'O orçamento total é obrigatório' })
  budget: number;

  @IsString()
  @IsOptional()
  description?: string;
}

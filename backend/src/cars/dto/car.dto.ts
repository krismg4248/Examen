import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export const SITUACIONES = [
  'Falta reparacion',
  'En proceso',
  'Terminado',
] as const;

export type Situacion = (typeof SITUACIONES)[number];

export class CreateCarDto {
  @IsString()
  marca: string;

  @IsString()
  modelo: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1950)
  @Max(2100)
  anio?: number;

  @IsOptional()
  @IsString()
  placa?: string;

  @IsOptional()
  @IsString()
  propietario?: string;

  @IsOptional()
  @IsIn([...SITUACIONES])
  situacion?: Situacion;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class UpdateCarDto {
  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1950)
  @Max(2100)
  anio?: number;

  @IsOptional()
  @IsString()
  placa?: string;

  @IsOptional()
  @IsString()
  propietario?: string;

  @IsOptional()
  @IsIn([...SITUACIONES])
  situacion?: Situacion;

  @IsOptional()
  @IsString()
  notas?: string;
}

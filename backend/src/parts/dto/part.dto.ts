import { IsOptional, IsString } from 'class-validator';

export class CreatePartDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsString()
  numero_parte: string;

  @IsString()
  auto: string;
}

export class UpdatePartDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  numero_parte?: string;

  @IsOptional()
  @IsString()
  auto?: string;
}

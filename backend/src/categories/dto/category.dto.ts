import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

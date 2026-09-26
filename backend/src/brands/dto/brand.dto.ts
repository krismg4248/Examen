import { IsOptional, IsString } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  pais_origen?: string;
}

export class UpdateBrandDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  pais_origen?: string;
}

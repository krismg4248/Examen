import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  sku: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsUUID()
  categoria_id?: string;

  @IsOptional()
  @IsUUID()
  marca_id?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precio: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock_minimo?: number;

  @IsOptional()
  @IsString()
  unidad?: string;

  @IsOptional()
  @IsString()
  compatible_con?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsUUID()
  categoria_id?: string;

  @IsOptional()
  @IsUUID()
  marca_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precio?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock_minimo?: number;

  @IsOptional()
  @IsString()
  unidad?: string;

  @IsOptional()
  @IsString()
  compatible_con?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class AdjustStockDto {
  @Type(() => Number)
  @IsInt()
  cantidad: number;
}

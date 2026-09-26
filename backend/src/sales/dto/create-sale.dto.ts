import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class SaleItemDto {
  @IsUUID()
  producto_id: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CreateSaleDto {
  @IsOptional()
  @IsUUID()
  cliente_id?: string;

  @IsOptional()
  @IsIn(['efectivo', 'tarjeta', 'transferencia'])
  metodo_pago?: 'efectivo' | 'tarjeta' | 'transferencia';

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}

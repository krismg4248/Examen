import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  AdjustStockDto,
  CreateProductDto,
  UpdateProductDto,
} from './dto/product.dto';

const PRODUCT_SELECT =
  '*, categorias(nombre), marcas(nombre)';

@Injectable()
export class ProductsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('productos')
      .select(PRODUCT_SELECT)
      .order('nombre');
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async lowStock() {
    const { data, error } = await this.supabase.client
      .from('productos')
      .select(PRODUCT_SELECT)
      .eq('activo', true);
    if (error) throw new BadRequestException(error.message);
    return (data ?? []).filter((p) => p.stock <= p.stock_minimo);
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.client
      .from('productos')
      .select(PRODUCT_SELECT)
      .eq('id', id)
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Producto no encontrado');
    return data;
  }

  async create(dto: CreateProductDto) {
    const { data, error } = await this.supabase.client
      .from('productos')
      .insert(dto)
      .select(PRODUCT_SELECT)
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async update(id: string, dto: UpdateProductDto) {
    const { data, error } = await this.supabase.client
      .from('productos')
      .update(dto)
      .eq('id', id)
      .select(PRODUCT_SELECT)
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Producto no encontrado');
    return data;
  }

  async adjustStock(id: string, dto: AdjustStockDto) {
    const product = await this.findOne(id);
    const stock = product.stock + dto.cantidad;
    if (stock < 0) {
      throw new BadRequestException('Stock insuficiente');
    }
    return this.update(id, { stock });
  }

  async remove(id: string) {
    const { error } = await this.supabase.client.from('productos').delete().eq('id', id);
    if (error) throw new BadRequestException(error.message);
    return { message: 'Producto eliminado' };
  }
}

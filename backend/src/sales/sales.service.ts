import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('ventas')
      .select(
        '*, clientes(nombre), usuarios(nombre, email), venta_detalle(*, productos(nombre, sku))',
      )
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.client
      .from('ventas')
      .select(
        '*, clientes(nombre), usuarios(nombre, email), venta_detalle(*, productos(nombre, sku))',
      )
      .eq('id', id)
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Venta no encontrada');
    return data;
  }

  async create(dto: CreateSaleDto, usuarioId: string) {
    const { data, error } = await this.supabase.client.rpc('registrar_venta', {
      p_cliente_id: dto.cliente_id ?? null,
      p_usuario_id: usuarioId,
      p_metodo_pago: dto.metodo_pago ?? 'efectivo',
      p_items: dto.items,
    });
    if (error) throw new BadRequestException(error.message);
    return this.findOne(data.id);
  }
}

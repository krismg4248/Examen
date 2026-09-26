import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('proveedores')
      .select('*')
      .order('nombre');
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async create(dto: CreateSupplierDto) {
    const { data, error } = await this.supabase.client
      .from('proveedores')
      .insert(dto)
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async update(id: string, dto: UpdateSupplierDto) {
    const { data, error } = await this.supabase.client
      .from('proveedores')
      .update(dto)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Proveedor no encontrado');
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.client.from('proveedores').delete().eq('id', id);
    if (error) throw new BadRequestException(error.message);
    return { message: 'Proveedor eliminado' };
  }
}

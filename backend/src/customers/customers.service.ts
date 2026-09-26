import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('clientes')
      .select('*')
      .order('nombre');
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async create(dto: CreateCustomerDto) {
    const { data, error } = await this.supabase.client
      .from('clientes')
      .insert(dto)
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const { data, error } = await this.supabase.client
      .from('clientes')
      .update(dto)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Cliente no encontrado');
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.client.from('clientes').delete().eq('id', id);
    if (error) throw new BadRequestException(error.message);
    return { message: 'Cliente eliminado' };
  }
}

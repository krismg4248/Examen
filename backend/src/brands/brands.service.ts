import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

@Injectable()
export class BrandsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('marcas')
      .select('*')
      .order('nombre');
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async create(dto: CreateBrandDto) {
    const { data, error } = await this.supabase.client
      .from('marcas')
      .insert(dto)
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async update(id: string, dto: UpdateBrandDto) {
    const { data, error } = await this.supabase.client
      .from('marcas')
      .update(dto)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Marca no encontrada');
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.client.from('marcas').delete().eq('id', id);
    if (error) throw new BadRequestException(error.message);
    return { message: 'Marca eliminada' };
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('categorias')
      .select('*')
      .order('nombre');
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async create(dto: CreateCategoryDto) {
    const { data, error } = await this.supabase.client
      .from('categorias')
      .insert(dto)
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const { data, error } = await this.supabase.client
      .from('categorias')
      .update(dto)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Categoria no encontrada');
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.client.from('categorias').delete().eq('id', id);
    if (error) throw new BadRequestException(error.message);
    return { message: 'Categoria eliminada' };
  }
}

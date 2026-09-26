import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePartDto, UpdatePartDto } from './dto/part.dto';

@Injectable()
export class PartsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('piezas')
      .select('id, nombre, descripcion, numero_parte, auto, created_at')
      .order('nombre');
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.client
      .from('piezas')
      .select('id, nombre, descripcion, numero_parte, auto, created_at')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Pieza no encontrada');
    return data;
  }

  async create(dto: CreatePartDto) {
    const { data, error } = await this.supabase.client
      .from('piezas')
      .insert(dto)
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async update(id: string, dto: UpdatePartDto) {
    const { data, error } = await this.supabase.client
      .from('piezas')
      .update(dto)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Pieza no encontrada');
    return data;
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    const { error } = await this.supabase.client.from('piezas').delete().eq('id', existing.id);
    if (error) throw new BadRequestException(error.message);
    return { message: 'Pieza eliminada' };
  }
}

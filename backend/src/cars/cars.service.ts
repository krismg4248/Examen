import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCarDto, UpdateCarDto } from './dto/car.dto';

@Injectable()
export class CarsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('autos')
      .select(
        'id, marca, modelo, anio, placa, propietario, situacion, notas, created_at',
      )
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.client
      .from('autos')
      .select(
        'id, marca, modelo, anio, placa, propietario, situacion, notas, created_at',
      )
      .eq('id', id)
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Auto no encontrado');
    return data;
  }

  async create(dto: CreateCarDto) {
    const { data, error } = await this.supabase.client
      .from('autos')
      .insert({
        ...dto,
        situacion: dto.situacion ?? 'Falta reparacion',
      })
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async update(id: string, dto: UpdateCarDto) {
    const { data, error } = await this.supabase.client
      .from('autos')
      .update(dto)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Auto no encontrado');
    return data;
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    const { error } = await this.supabase.client
      .from('autos')
      .delete()
      .eq('id', existing.id);
    if (error) throw new BadRequestException(error.message);
    return { message: 'Auto eliminado' };
  }
}

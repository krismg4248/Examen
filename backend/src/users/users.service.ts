import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SupabaseService } from '../supabase/supabase.service';
import { ChangePasswordDto, UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('usuarios')
      .select('id, nombre, email, rol, activo, created_at')
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.client
      .from('usuarios')
      .select('id, nombre, email, rol, activo, created_at')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Usuario no encontrado');
    return data;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const payload = { ...dto };
    if (payload.email) payload.email = payload.email.toLowerCase();
    const { data, error } = await this.supabase.client
      .from('usuarios')
      .update(payload)
      .eq('id', id)
      .select('id, nombre, email, rol, activo, created_at')
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    await this.findOne(id);
    const password_hash = await bcrypt.hash(dto.password, 10);
    const { error } = await this.supabase.client
      .from('usuarios')
      .update({ password_hash })
      .eq('id', id);
    if (error) throw new BadRequestException(error.message);
    return { message: 'Contrasena actualizada' };
  }
}

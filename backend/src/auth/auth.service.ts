import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { data: existing } = await this.supabase.client
      .from('usuarios')
      .select('id')
      .eq('email', dto.email.toLowerCase())
      .maybeSingle();

    if (existing) {
      throw new ConflictException('El correo ya esta registrado');
    }

    const password_hash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const { data, error } = await this.supabase.client
      .from('usuarios')
      .insert({
        nombre: dto.nombre,
        email: dto.email.toLowerCase(),
        password_hash,
        rol: dto.rol ?? 'empleado',
      })
      .select('id, nombre, email, rol, activo, created_at')
      .single();

    if (error) {
      throw new ConflictException(error.message);
    }

    return {
      usuario: data,
      access_token: this.signToken(data),
    };
  }

  async login(dto: LoginDto) {
    const { data: user, error } = await this.supabase.client
      .from('usuarios')
      .select('id, nombre, email, rol, activo, password_hash')
      .eq('email', dto.email.toLowerCase())
      .maybeSingle();

    if (error || !user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const ok = await bcrypt.compare(dto.password, user.password_hash);
    if (!ok) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const { password_hash: _, ...usuario } = user;
    return {
      usuario,
      access_token: this.signToken(usuario),
    };
  }

  private signToken(user: { id: string; email: string; rol: string; nombre: string }) {
    return this.jwt.sign({
      sub: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
    });
  }
}

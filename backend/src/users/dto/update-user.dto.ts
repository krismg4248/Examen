import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(['administrador', 'empleado'])
  rol?: 'administrador' | 'empleado';

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  password: string;
}

import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(['admin', 'empleado', 'cajero'])
  rol?: 'admin' | 'empleado' | 'cajero';

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  password: string;
}

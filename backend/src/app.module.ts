import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'fs';
import { join } from 'path';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PartsModule } from './parts/parts.module';
import { CarsModule } from './cars/cars.module';

function resolveFrontendDist(): string {
  const candidates = [
    join(__dirname, '..', 'public'),
    join(__dirname, '..', '..', 'frontend', 'dist'),
    join(process.cwd(), 'public'),
    join(process.cwd(), '..', 'frontend', 'dist'),
  ];
  const found = candidates.find((dir) => existsSync(join(dir, 'index.html')));
  return found ?? join(__dirname, '..', 'public');
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: resolveFrontendDist(),
      exclude: ['/api/(.*)'],
    }),
    SupabaseModule,
    AuthModule,
    UsersModule,
    PartsModule,
    CarsModule,
  ],
})
export class AppModule {}

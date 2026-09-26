import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('marcas')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BrandsController {
  constructor(private readonly brands: BrandsService) {}

  @Get()
  findAll() {
    return this.brands.findAll();
  }

  @Post()
  @Roles('admin', 'empleado')
  create(@Body() dto: CreateBrandDto) {
    return this.brands.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'empleado')
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.brands.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.brands.remove(id);
  }
}

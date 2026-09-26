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
import { CarsService } from './cars.service';
import { CreateCarDto, UpdateCarDto } from './dto/car.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('autos')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CarsController {
  constructor(private readonly cars: CarsService) {}

  @Get()
  findAll() {
    return this.cars.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cars.findOne(id);
  }

  @Post()
  @Roles('administrador')
  create(@Body() dto: CreateCarDto) {
    return this.cars.create(dto);
  }

  @Patch(':id')
  @Roles('administrador')
  update(@Param('id') id: string, @Body() dto: UpdateCarDto) {
    return this.cars.update(id, dto);
  }

  @Delete(':id')
  @Roles('administrador')
  remove(@Param('id') id: string) {
    return this.cars.remove(id);
  }
}

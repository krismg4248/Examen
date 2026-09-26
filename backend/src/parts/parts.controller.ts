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
import { PartsService } from './parts.service';
import { CreatePartDto, UpdatePartDto } from './dto/part.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('piezas')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PartsController {
  constructor(private readonly parts: PartsService) {}

  @Get()
  findAll() {
    return this.parts.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parts.findOne(id);
  }

  @Post()
  @Roles('administrador')
  create(@Body() dto: CreatePartDto) {
    return this.parts.create(dto);
  }

  @Patch(':id')
  @Roles('administrador')
  update(@Param('id') id: string, @Body() dto: UpdatePartDto) {
    return this.parts.update(id, dto);
  }

  @Delete(':id')
  @Roles('administrador')
  remove(@Param('id') id: string) {
    return this.parts.remove(id);
  }
}

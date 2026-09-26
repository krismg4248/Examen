import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('ventas')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SalesController {
  constructor(private readonly sales: SalesService) {}

  @Get()
  findAll() {
    return this.sales.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sales.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateSaleDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.sales.create(dto, user.id);
  }
}

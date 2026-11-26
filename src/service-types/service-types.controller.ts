
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ServiceTypesService } from './service-types.service';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('service-types')
export class ServiceTypesController {
  constructor(
    private readonly serviceTypesService: ServiceTypesService,
  ) {}

  @Post()
  create(@Body() dto: CreateServiceTypeDto) {
    return this.serviceTypesService.create(dto);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.serviceTypesService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceTypesService.findOne(id);
  }

  @Put(':id')
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateServiceTypeDto,
  ) {
    return this.serviceTypesService.replace(id, dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceTypeDto,
  ) {
    return this.serviceTypesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviceTypesService.remove(id);
  }
}

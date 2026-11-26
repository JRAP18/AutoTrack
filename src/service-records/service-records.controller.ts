
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
  Request,
  ParseIntPipe,
  ParseEnumPipe,
  UseGuards,
} from '@nestjs/common';
import { ServiceRecordsService } from './service-records.service';
import { CreateServiceRecordDto } from './dto/create-service-record.dto';
import { UpdateServiceRecordDto } from './dto/update-service-record.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ServiceStatus } from './service-record.entity';

@UseGuards(JwtAuthGuard)
@Controller('service-records')
export class ServiceRecordsController {
  constructor(
    private readonly serviceRecordsService: ServiceRecordsService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateServiceRecordDto,
    @Request() req: { user: { userId: number } },
  ) {
    return this.serviceRecordsService.create(
      dto,
      req.user.userId,
    );
  }

  @Get()
  findAll(
    @Query(
      'status',
      new ParseEnumPipe(ServiceStatus, { optional: true }),
    )
    status?: ServiceStatus,

    @Query(
      'vehicleId',
      new ParseIntPipe({ optional: true }),
    )
    vehicleId?: number,
  ) {
    return this.serviceRecordsService.findAll(
      status,
      vehicleId,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceRecordsService.findOne(id);
  }

  @Put(':id')
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateServiceRecordDto,
  ) {
    return this.serviceRecordsService.replace(id, dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceRecordDto,
  ) {
    return this.serviceRecordsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviceRecordsService.remove(id);
  }
}

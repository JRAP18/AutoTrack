
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Customer } from '../customers/customer.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { ServiceType } from '../service-types/service-type.entity';
import { ServiceRecord } from '../service-records/service-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      Vehicle,
      ServiceType,
      ServiceRecord,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}

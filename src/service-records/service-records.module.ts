
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRecord } from './service-record.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { ServiceType } from '../service-types/service-type.entity';
import { ServiceRecordsService } from './service-records.service';
import { ServiceRecordsController } from './service-records.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceRecord,
      Vehicle,
      ServiceType,
    ]),
  ],
  controllers: [ServiceRecordsController],
  providers: [ServiceRecordsService],
  exports: [ServiceRecordsService],
})
export class ServiceRecordsModule {}

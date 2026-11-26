
import {
  IsInt,
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsOptional,
  IsNumber,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { ServiceStatus } from '../service-record.entity';

export class CreateServiceRecordDto {
  @IsInt()
  @Min(1)
  vehicleId: number;

  @IsInt()
  @Min(1)
  serviceTypeId: number;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  serviceDate: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  cost: number;
}

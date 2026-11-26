
import {
  IsOptional,
  IsDateString,
  IsEnum,
  Matches,
} from 'class-validator';
import { ServiceStatus } from '../../service-records/service-record.entity';

export class ReportFilterDto {
  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate?: string;

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;
}

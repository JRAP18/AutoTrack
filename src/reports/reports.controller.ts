
import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
  ) {}

  @Get('dashboard')
  getDashboard() {
    return this.reportsService.getDashboard();
  }

  @Get('services')
  getServiceReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getServiceReport(filter);
  }

  @Get('service-value')
  getServiceValueReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getServiceValueReport(filter);
  }
}

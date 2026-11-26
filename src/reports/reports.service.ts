
import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { ServiceType } from '../service-types/service-type.entity';
import {
  ServiceRecord,
  ServiceStatus,
} from '../service-records/service-record.entity';
import { ReportFilterDto } from './dto/report-filter.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,

    @InjectRepository(ServiceType)
    private readonly serviceTypeRepository: Repository<ServiceType>,

    @InjectRepository(ServiceRecord)
    private readonly serviceRecordRepository: Repository<ServiceRecord>,
  ) {}

  async getDashboard() {
    const totalCustomers =
      await this.customerRepository.count();

    const totalVehicles =
      await this.vehicleRepository.count();

    const totalServiceTypes =
      await this.serviceTypeRepository.count();

    const totalServiceRecords =
      await this.serviceRecordRepository.count();

    const pending =
      await this.serviceRecordRepository.countBy({
        status: ServiceStatus.PENDING,
      });

    const inProgress =
      await this.serviceRecordRepository.countBy({
        status: ServiceStatus.IN_PROGRESS,
      });

    const completed =
      await this.serviceRecordRepository.countBy({
        status: ServiceStatus.COMPLETED,
      });

    const cancelled =
      await this.serviceRecordRepository.countBy({
        status: ServiceStatus.CANCELLED,
      });

    const result = await this.serviceRecordRepository
      .createQueryBuilder('record')
      .select('COALESCE(SUM(record.cost), 0)', 'total')
      .where('record.status = :status', {
        status: ServiceStatus.COMPLETED,
      })
      .getRawOne<{ total: string }>();

    const recentRecords =
      await this.serviceRecordRepository.find({
        relations: {
          vehicle: {
            customer: true,
          },
          serviceType: true,
        },
        order: {
          serviceRecordId: 'DESC',
        },
        take: 5,
      });

    return {
      totalCustomers,
      totalVehicles,
      totalServiceTypes,
      totalServiceRecords,
      totalCompletedServiceValue: Number(result?.total ?? 0),
      serviceStatus: {
        pending,
        inProgress,
        completed,
        cancelled,
      },
      recentRecords,
    };
  }

  async getServiceReport(filter: ReportFilterDto) {
    const { startDate, endDate, status } = filter;

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'Start date must not be later than end date',
      );
    }

    const query = this.serviceRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.vehicle', 'vehicle')
      .leftJoinAndSelect('vehicle.customer', 'customer')
      .leftJoinAndSelect('record.serviceType', 'serviceType');

    if (startDate) {
      query.andWhere(
        'record.serviceDate >= :startDate',
        { startDate },
      );
    }

    if (endDate) {
      query.andWhere(
        'record.serviceDate <= :endDate',
        { endDate },
      );
    }

    if (status) {
      query.andWhere('record.status = :status', {
        status,
      });
    }

    const records = await query
      .orderBy('record.serviceDate', 'DESC')
      .addOrderBy('record.serviceRecordId', 'DESC')
      .getMany();

    const completedRecords = records.filter(
      (record) => record.status === ServiceStatus.COMPLETED,
    );

    const totalCompletedServiceValue =
      completedRecords.reduce(
        (total, record) =>
          total + Math.round(Number(record.cost) * 100),
        0,
      ) / 100;

    return {
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      status: status ?? 'All',
      totalRecords: records.length,
      completedRecords: completedRecords.length,
      totalCompletedServiceValue,
      records,
    };
  }

  async getServiceValueReport(filter: ReportFilterDto) {
    const report = await this.getServiceReport({
      ...filter,
      status: ServiceStatus.COMPLETED,
    });

    return {
      startDate: report.startDate,
      endDate: report.endDate,
      totalCompletedServices: report.completedRecords,
      totalCompletedServiceValue:
        report.totalCompletedServiceValue,
      records: report.records,
    };
  }
}

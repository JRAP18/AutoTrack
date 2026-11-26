
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ServiceRecord,
  ServiceStatus,
} from './service-record.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { ServiceType } from '../service-types/service-type.entity';
import { CreateServiceRecordDto } from './dto/create-service-record.dto';
import { UpdateServiceRecordDto } from './dto/update-service-record.dto';

@Injectable()
export class ServiceRecordsService {
  constructor(
    @InjectRepository(ServiceRecord)
    private readonly serviceRecordRepository: Repository<ServiceRecord>,

    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,

    @InjectRepository(ServiceType)
    private readonly serviceTypeRepository: Repository<ServiceType>,
  ) {}

  async create(dto: CreateServiceRecordDto, userId: number) {
    const vehicle = await this.vehicleRepository.findOneBy({
      vehicleId: dto.vehicleId,
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const serviceType =
      await this.serviceTypeRepository.findOneBy({
        serviceTypeId: dto.serviceTypeId,
      });

    if (!serviceType) {
      throw new NotFoundException('Service type not found');
    }

    const record = this.serviceRecordRepository.create({
      ...dto,
      userId,
      status: dto.status ?? ServiceStatus.PENDING,
    });

    return this.serviceRecordRepository.save(record);
  }

  async findAll(
    status?: ServiceStatus,
    vehicleId?: number,
  ) {
    return this.serviceRecordRepository.find({
      where: {
        ...(status !== undefined ? { status } : {}),
        ...(vehicleId !== undefined ? { vehicleId } : {}),
      },
      relations: {
        vehicle: {
          customer: true,
        },
        serviceType: true,
      },
      order: {
        serviceDate: 'DESC',
        serviceRecordId: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const record =
      await this.serviceRecordRepository.findOne({
        where: {
          serviceRecordId: id,
        },
        relations: {
          vehicle: {
            customer: true,
          },
          serviceType: true,
        },
      });

    if (!record) {
      throw new NotFoundException(
        'Service record not found',
      );
    }

    return record;
  }

  async update(
    id: number,
    dto: UpdateServiceRecordDto,
  ) {
    await this.findOne(id);

    if (Object.values(dto).some(value => value === null)) {
      throw new BadRequestException(
        'Service record fields must not be null',
      );
    }

    if (dto.vehicleId !== undefined) {
      const vehicle =
        await this.vehicleRepository.findOneBy({
          vehicleId: dto.vehicleId,
        });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }
    }

    if (dto.serviceTypeId !== undefined) {
      const serviceType =
        await this.serviceTypeRepository.findOneBy({
          serviceTypeId: dto.serviceTypeId,
        });

      if (!serviceType) {
        throw new NotFoundException(
          'Service type not found',
        );
      }
    }

    if (Object.keys(dto).length > 0) {
      await this.serviceRecordRepository.update(id, dto);
    }

    return this.findOne(id);
  }

  async replace(
    id: number,
    dto: CreateServiceRecordDto,
  ) {
    return this.update(id, {
      ...dto,
      status: dto.status ?? ServiceStatus.PENDING,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.serviceRecordRepository.delete(id);

    return {
      message: 'Service record deleted successfully',
    };
  }
}

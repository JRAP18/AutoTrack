
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Like,
  QueryFailedError,
} from 'typeorm';
import { ServiceType } from './service-type.entity';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';

@Injectable()
export class ServiceTypesService {
  constructor(
    @InjectRepository(ServiceType)
    private readonly serviceTypeRepository: Repository<ServiceType>,
  ) {}

  async create(dto: CreateServiceTypeDto) {
    const serviceName = dto.serviceName.trim();

    if (!serviceName) {
      throw new BadRequestException(
        'Service name is required',
      );
    }

    const existingService =
      await this.serviceTypeRepository.findOneBy({
        serviceName,
      });

    if (existingService) {
      throw new ConflictException(
        'Service name already exists',
      );
    }

    const service = this.serviceTypeRepository.create({
      ...dto,
      serviceName,
    });

    return this.serviceTypeRepository.save(service);
  }

  async findAll(search?: string) {
    return this.serviceTypeRepository.find({
      where: search
        ? [
            { serviceName: Like(`%${search}%`) },
            { description: Like(`%${search}%`) },
          ]
        : {},
      order: {
        serviceTypeId: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const service =
      await this.serviceTypeRepository.findOneBy({
        serviceTypeId: id,
      });

    if (!service) {
      throw new NotFoundException(
        'Service type not found',
      );
    }

    return service;
  }

  async update(id: number, dto: UpdateServiceTypeDto) {
    await this.findOne(id);

    if (Object.values(dto).some(value => value === null)) {
      throw new BadRequestException(
        'Service fields must not be null',
      );
    }

    if (dto.serviceName !== undefined) {
      dto.serviceName = dto.serviceName.trim();

      if (!dto.serviceName) {
        throw new BadRequestException(
          'Service name is required',
        );
      }

      const existingService =
        await this.serviceTypeRepository.findOneBy({
          serviceName: dto.serviceName,
        });

      if (
        existingService &&
        existingService.serviceTypeId !== id
      ) {
        throw new ConflictException(
          'Service name already exists',
        );
      }
    }

    if (Object.keys(dto).length > 0) {
      await this.serviceTypeRepository.update(id, dto);
    }

    return this.findOne(id);
  }

  async replace(id: number, dto: CreateServiceTypeDto) {
    return this.update(id, dto);
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.serviceTypeRepository.delete(id);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError?.code ===
          'ER_ROW_IS_REFERENCED_2'
      ) {
        throw new ConflictException(
          'Cannot delete service type with existing service records',
        );
      }

      throw error;
    }

    return {
      message: 'Service type deleted successfully',
    };
  }
}

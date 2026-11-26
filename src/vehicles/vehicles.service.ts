
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { Customer } from '../customers/customer.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,

    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(dto: CreateVehicleDto) {
    const customer = await this.customerRepository.findOneBy({
      customerId: dto.customerId,
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const plateNumber = dto.plateNumber.trim().toUpperCase();

    const existingVehicle =
      await this.vehicleRepository.findOneBy({
        plateNumber,
      });

    if (existingVehicle) {
      throw new ConflictException(
        'Plate number already exists',
      );
    }

    const vehicle = this.vehicleRepository.create({
      ...dto,
      plateNumber,
    });

    return this.vehicleRepository.save(vehicle);
  }

  async findAll(search?: string, customerId?: number) {
    const filter =
      customerId !== undefined ? { customerId } : {};

    return this.vehicleRepository.find({
      where: search
        ? [
            { ...filter, plateNumber: Like(`%${search}%`) },
            { ...filter, brand: Like(`%${search}%`) },
            { ...filter, model: Like(`%${search}%`) },
          ]
        : filter,
      relations: {
        customer: true,
      },
      order: {
        vehicleId: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const vehicle = await this.vehicleRepository.findOne({
      where: { vehicleId: id },
      relations: {
        customer: true,
        serviceRecords: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async update(id: number, dto: UpdateVehicleDto) {
    await this.findOne(id);

    if (Object.values(dto).some(value => value === null)) {
      throw new BadRequestException(
        'Vehicle fields must not be null',
      );
    }

    if (dto.customerId !== undefined) {
      const customer = await this.customerRepository.findOneBy({
        customerId: dto.customerId,
      });

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    if (dto.plateNumber !== undefined) {
      dto.plateNumber = dto.plateNumber.trim().toUpperCase();

      const existingVehicle =
        await this.vehicleRepository.findOneBy({
          plateNumber: dto.plateNumber,
        });

      if (
        existingVehicle &&
        existingVehicle.vehicleId !== id
      ) {
        throw new ConflictException(
          'Plate number already exists',
        );
      }
    }

    if (Object.keys(dto).length > 0) {
      await this.vehicleRepository.update(id, dto);
    }

    return this.findOne(id);
  }

  async replace(id: number, dto: CreateVehicleDto) {
    return this.update(id, dto);
  }

  async remove(id: number) {
    const vehicle = await this.findOne(id);

    if (vehicle.serviceRecords.length > 0) {
      throw new ConflictException(
        'Cannot delete vehicle with service records',
      );
    }

    await this.vehicleRepository.delete(id);

    return {
      message: 'Vehicle deleted successfully',
    };
  }
}

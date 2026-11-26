
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto) {
    const customer = this.customerRepository.create(dto);
    return this.customerRepository.save(customer);
  }

  async findAll(search?: string) {
    if (search) {
      return this.customerRepository.find({
        where: [
          { firstName: Like(`%${search}%`) },
          { lastName: Like(`%${search}%`) },
          { phone: Like(`%${search}%`) },
        ],
        order: { customerId: 'DESC' },
      });
    }

    return this.customerRepository.find({
      order: { customerId: 'DESC' },
    });
  }

  async findOne(id: number) {
    const customer = await this.customerRepository.findOne({
      where: { customerId: id },
      relations: { vehicles: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async replace(id: number, dto: CreateCustomerDto) {
    const customer = await this.findOne(id);

    customer.firstName = dto.firstName;
    customer.lastName = dto.lastName;
    customer.phone = dto.phone;
    customer.address = dto.address;

    await this.customerRepository.update(id, {
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      address: customer.address,
      email: dto.email ?? (() => 'NULL'),
    });

    return this.findOne(id);
  }

  async update(id: number, dto: UpdateCustomerDto) {
    await this.findOne(id);

    if (Object.values(dto).some(value => value === null)) {
      throw new ConflictException(
        'Customer fields must not be null',
      );
    }

    if (Object.keys(dto).length > 0) {
      await this.customerRepository.update(id, dto);
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const customer = await this.findOne(id);

    if (customer.vehicles.length > 0) {
      throw new ConflictException(
        'Cannot delete customer with registered vehicles',
      );
    }

    await this.customerRepository.delete(id);

    return {
      message: 'Customer deleted successfully',
    };
  }
}


import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { ServiceRecord } from '../service-records/service-record.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  vehicleId: number;

  @Column()
  customerId: number;

  @Column({ length: 20, unique: true })
  plateNumber: string;

  @Column({ length: 50 })
  brand: string;

  @Column({ length: 50 })
  model: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ length: 30 })
  color: string;

  @ManyToOne(() => Customer, (customer) => customer.vehicles, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @OneToMany(() => ServiceRecord, (record) => record.vehicle)
  serviceRecords: ServiceRecord[];
}


import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vehicle } from '../vehicles/vehicle.entity';
import { ServiceType } from '../service-types/service-type.entity';
import { User } from '../users/user.entity';

export enum ServiceStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

@Entity('service_records')
export class ServiceRecord {
  @PrimaryGeneratedColumn()
  serviceRecordId: number;

  @Column()
  vehicleId: number;

  @Column()
  serviceTypeId: number;

  @Column()
  userId: number;

  @Column({ type: 'date' })
  serviceDate: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ServiceStatus,
    default: ServiceStatus.PENDING,
  })
  status: ServiceStatus;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  cost: number;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.serviceRecords, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @ManyToOne(() => ServiceType, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'serviceTypeId' })
  serviceType: ServiceType;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}

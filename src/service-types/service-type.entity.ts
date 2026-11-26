
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('service_types')
export class ServiceType {
  @PrimaryGeneratedColumn()
  serviceTypeId: number;

  @Column({ length: 100, unique: true })
  serviceName: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  basePrice: number;
}

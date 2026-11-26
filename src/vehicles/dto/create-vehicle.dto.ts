
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateVehicleDto {
  @IsInt()
  @Min(1)
  customerId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  plateNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  brand: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  model: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  color: string;
}

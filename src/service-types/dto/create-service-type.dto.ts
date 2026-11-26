
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateServiceTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  serviceName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  basePrice: number;
}

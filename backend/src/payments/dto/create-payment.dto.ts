import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 'monthly', enum: ['monthly', 'yearly'] })
  @IsString()
  plan: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CLICK })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}

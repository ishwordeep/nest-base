import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer'; 
import { CreateOrderItemDto } from './create-order-item.dto';
import { CreateShippingAddressDto } from 'src/user/dto/create-shipping-address.dto';
import { OrderStatus, PaymentMethod } from '../schema/create.schema';

export class CreateOrderDto {
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  orderNumber?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountTotal?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  shippingFee?: number;

  @IsNumber()
  @Min(0)
  grandTotal: number;

  @ValidateNested()
  @Type(() => CreateShippingAddressDto)
  shippingAddress: CreateShippingAddressDto;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

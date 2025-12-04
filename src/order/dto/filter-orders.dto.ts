import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../schema/create.schema';

export class FilterOrdersDto {
  /**
   * Filter orders by status
   * @example "PAID"
   */
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  status?: OrderStatus;
}
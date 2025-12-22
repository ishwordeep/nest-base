import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../schema/create.schema';

export class UpdateOrderStatusDto {
  /**
   * New status for the order
   * @example "SHIPPED"
   */
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  status: OrderStatus;
}
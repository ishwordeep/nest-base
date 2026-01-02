import { IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { OrderStatus } from '../schema/create.schema';
import { Type } from 'class-transformer';

export class FilterOrdersDto {
  /**
   * Filter orders by status
   * @example "PAID"
   */
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  status?: OrderStatus;

  /**
   * Page number (1-based)
   * @example 1
   * @default 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  /**
   * Number of items per page
   * @example 10
   * @default 10
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number;
}

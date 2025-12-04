// src/cart/dto/update-quantity.dto.ts
import { IsMongoId, IsInt, Min } from 'class-validator';

export class UpdateCartItemQuantityDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  itemId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

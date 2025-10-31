import { IsArray, ArrayNotEmpty } from 'class-validator';

export class UpdateProductFlagDto {
  @IsArray()
  @ArrayNotEmpty()
  ids: string[]; // Array of product IDs
}

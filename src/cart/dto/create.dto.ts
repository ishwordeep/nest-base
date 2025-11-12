import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsNumber,
  IsArray,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';



export class CreateCartDto {
  @IsMongoId()
  @IsOptional()
  userId?: Types.ObjectId;

 @IsMongoId()
  @IsNotEmpty()
  productId: Types.ObjectId;

  @IsNumber()
  @Min(1)
  quantity: number;


  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  size?: string;
}

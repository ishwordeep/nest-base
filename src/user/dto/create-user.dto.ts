// src/modules/users/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { UserRole } from '../schema/user.schema';



export class CreateUserDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsOptional()
    role?: UserRole;
}

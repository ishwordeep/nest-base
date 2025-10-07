import { IsBoolean, IsNotEmpty, IsOptional } from "class-validator";

export class CreateCompanyDto {
    @IsNotEmpty()
    name: string

    logo: string

    address: string

    @IsBoolean()
    isActive: boolean
}
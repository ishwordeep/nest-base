import { IsEmail, IsOptional, IsString, Matches, MaxLength, IsUrl } from 'class-validator';

export class CreateSettingDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    postalCode?: string;

    @IsOptional()
    logoUrl?: string;

    @IsOptional()
    faviconUrl?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Invalid Facebook URL' })
    facebook?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Invalid Instagram URL' })
    instagram?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Invalid TikTok URL' })
    tiktok?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}

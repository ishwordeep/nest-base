import { PartialType } from '@nestjs/mapped-types';
import { CreateSettingDto } from './create.dto';

export class UpdateSettingDto extends PartialType(CreateSettingDto) {}

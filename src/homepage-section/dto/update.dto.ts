import { PartialType } from '@nestjs/mapped-types';
import { CreateHomepageSectionDto } from './create.dto';

export class UpdateHomepageSectionDto extends PartialType(CreateHomepageSectionDto) {}
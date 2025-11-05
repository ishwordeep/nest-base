import { PartialType } from '@nestjs/mapped-types';
import { CreateSliderDto } from './create.dto';

export class UpdateSliderDto extends PartialType(CreateSliderDto) {}
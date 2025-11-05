import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SliderController } from './slider.controller';
import { SliderService } from './slider.service';
import { Slider, SliderSchema } from './schema/create.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Slider.name, schema: SliderSchema }]),
  ],
  controllers: [SliderController],
  providers: [SliderService],
  exports: [SliderService],
})
export class SliderModule {}
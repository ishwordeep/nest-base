import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Slider, SliderDocument } from '../../slider/schema/create.schema';

@Injectable()
export class FrontendSliderService {
  constructor(
    @InjectModel(Slider.name) private sliderModel: Model<SliderDocument>,
  ) {}

  async findActiveSliders(): Promise<Slider[]> {
    // Get all active sliders ordered by displayOrder
    return this.sliderModel.find({ isActive: true }).sort({ displayOrder: 1 }).exec();
  }
}
import { Controller, Get } from '@nestjs/common';
import { FrontendSliderService } from './slider.service';

@Controller('frontend/slider')
export class FrontendSliderController {
  constructor(private readonly sliderService: FrontendSliderService) {}

  @Get()
  async findActiveSliders() {
    // Get all active sliders ordered by displayOrder
    return this.sliderService.findActiveSliders();
  }
}
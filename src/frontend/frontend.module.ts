import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Slider, SliderSchema } from '../slider/schema/create.schema';
import { Product, ProductSchema } from '../product/schema/create.schema';
import { Category, CategorySchema } from '../category/schema/create.schema';
import { FrontendSliderController } from './slider/slider.controller';
import { FrontendSliderService } from './slider/slider.service';
import { FrontendProductController } from './product/product.controller';
import { FrontendProductService } from './product/product.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Slider.name, schema: SliderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [FrontendSliderController, FrontendProductController],
  providers: [FrontendSliderService, FrontendProductService],
})
export class FrontendModule {}

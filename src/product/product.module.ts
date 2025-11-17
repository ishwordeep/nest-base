import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schema/create.schema';
import { CategoryModule } from 'src/category/category.module';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';

@Module({
 imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    CategoryModule, // <- separate import; brings in CategoryModel via exports
  ],
  controllers: [ProductController, FaqController],
  providers: [ProductService, FaqService],
  exports: [ProductService],
})
export class ProductModule { }

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Category, CategoryDocument } from 'src/category/schema/create.schema';
import { CreateCategoryDto } from 'src/category/dto/create.dto';

async function bootstrap() {
  // 1️⃣ Create Nest application context
  const app = await NestFactory.createApplicationContext(AppModule);

  // 2️⃣ Get the Category model from Nest's DI container
  const categoryModel = app.get<Model<CategoryDocument>>(getModelToken(Category.name));

  // 3️⃣ Prepare category data
  const categories: CreateCategoryDto[] = [
    {
      name: 'Men',
      slug: 'men',
      description: 'Men\'s clothing and accessories',
      isActive: true,
      displayOrder: 1,
    },
    {
      name: 'Women',
      slug: 'women',
      description: 'Women\'s clothing and accessories',
      isActive: true,
      displayOrder: 2,
    },
    {
      name: 'Kids',
      slug: 'kids',
      description: 'Children\'s clothing and accessories',
      isActive: true,
      displayOrder: 3,
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Fashion accessories for all',
      isActive: true,
      displayOrder: 4,
    },
    {
      name: 'Footwear',
      slug: 'footwear',
      description: 'Shoes, sandals, and boots',
      isActive: true,
      displayOrder: 5,
    },
  ];

  // 4️⃣ Seed each category
  for (const categoryData of categories) {
    // Check if category already exists
    const existing = await categoryModel.findOne({ slug: categoryData.slug });

    if (existing) {
      console.log(`⚠️  Category "${categoryData.name}" already exists, skipping.`);
    } else {
      // Create new category
      const created = await categoryModel.create(categoryData);
      console.log(`✅ Category seeded successfully: ${created.name}`);
    }
  }

  // 5️⃣ Close the Nest app context
  await app.close();
  console.log('🌱 Categories seeding completed');
}

bootstrap();
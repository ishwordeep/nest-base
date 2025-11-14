import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Product, ProductDocument } from 'src/product/schema/create.schema';
import { CreateProductDto } from 'src/product/dto/create.dto';
import { Category, CategoryDocument } from 'src/category/schema/create.schema';

async function bootstrap() {
  // 1️⃣ Create Nest application context
  const app = await NestFactory.createApplicationContext(AppModule);

  // 2️⃣ Get the models from Nest's DI container
  const productModel = app.get<Model<ProductDocument>>(getModelToken(Product.name));
  const categoryModel = app.get<Model<CategoryDocument>>(getModelToken(Category.name));

  // 3️⃣ Fetch all categories to use their IDs
  const categories = await categoryModel.find().exec();

  if (categories.length === 0) {
    console.log('⚠️ No categories found. Please run the category seeder first.');
    await app.close();
    return;
  }

  // Create a map of category slugs to their IDs for easy lookup
  const categoryMap = new Map<string, string>();
  categories.forEach((category: CategoryDocument) => {
    categoryMap.set(category.slug, category.id.toString());
  });

  // 4️⃣ Prepare product data
  const products = [
    // Men's products
    {
      name: 'Men\'s Classic T-Shirt',
      slug: 'mens-classic-tshirt',
      category: categoryMap.get('men'),
      description: 'A comfortable classic t-shirt for everyday wear.',
      price: 29.99,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White', 'Navy'],
      isActive: true,
      isFeatured: true,
      tags: ['t-shirt', 'casual', 'men'],
    },
    {
      name: 'Men\'s Slim Fit Jeans',
      slug: 'mens-slim-fit-jeans',
      category: categoryMap.get('men'),
      description: 'Modern slim fit jeans with a comfortable stretch.',
      price: 59.99,
      sizes: ['30', '32', '34', '36'],
      colors: ['Blue', 'Black'],
      isActive: true,
      isNew: true,
      tags: ['jeans', 'slim fit', 'men'],
    },

    // Women's products
    {
      name: 'Women\'s Floral Dress',
      slug: 'womens-floral-dress',
      category: categoryMap.get('women'),
      description: 'A beautiful floral dress perfect for summer days.',
      price: 49.99,
      discount: 10,
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Blue', 'Pink'],
      isActive: true,
      isFeatured: true,
      tags: ['dress', 'floral', 'summer', 'women'],
    },
    {
      name: 'Women\'s High-Waisted Leggings',
      slug: 'womens-high-waisted-leggings',
      category: categoryMap.get('women'),
      description: 'Comfortable high-waisted leggings for workout or casual wear.',
      price: 34.99,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Black', 'Gray', 'Navy'],
      isActive: true,
      isTrending: true,
      tags: ['leggings', 'workout', 'women'],
    },

    // Kids' products
    {
      name: 'Kids\' Dinosaur T-Shirt',
      slug: 'kids-dinosaur-tshirt',
      category: categoryMap.get('kids'),
      description: 'Fun dinosaur print t-shirt for kids who love adventure.',
      price: 19.99,
      sizes: ['3T', '4T', '5T', '6T'],
      colors: ['Green', 'Blue'],
      isActive: true,
      isNew: true,
      tags: ['t-shirt', 'dinosaur', 'kids'],
    },

    // Accessories
    {
      name: 'Classic Leather Belt',
      slug: 'classic-leather-belt',
      category: categoryMap.get('accessories'),
      description: 'A timeless leather belt that complements any outfit.',
      price: 39.99,
      sizes: ['S', 'M', 'L'],
      colors: ['Brown', 'Black'],
      isActive: true,
      tags: ['belt', 'leather', 'accessories'],
    },

    // Footwear
    {
      name: 'Running Shoes',
      slug: 'running-shoes',
      category: categoryMap.get('footwear'),
      description: 'Lightweight and comfortable running shoes for all terrains.',
      price: 89.99,
      discount: 15,
      sizes: ['7', '8', '9', '10', '11', '12'],
      colors: ['Black/Red', 'Blue/White', 'Gray/Green'],
      isActive: true,
      isFeatured: true,
      isTrending: true,
      tags: ['shoes', 'running', 'athletic', 'footwear'],
    },
  ];

  // 5️⃣ Seed each product
  for (const productData of products) {
    // Check if product already exists
    const existing = await productModel.findOne({ slug: productData.slug });

    if (existing) {
      console.log(`⚠️  Product "${productData.name}" already exists, skipping.`);
    } else {
      // Create new product
      const created = await productModel.create(productData);
      console.log(`✅ Product seeded successfully: ${created.name}`);
    }
  }

  // 6️⃣ Close the Nest app context
  await app.close();
  console.log('🌱 Products seeding completed');
}

bootstrap();

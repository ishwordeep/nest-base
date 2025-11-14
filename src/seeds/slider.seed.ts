import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Slider, SliderDocument } from 'src/slider/schema/create.schema';
import { CreateSliderDto } from 'src/slider/dto/create.dto';

async function bootstrap() {
  // 1️⃣ Create Nest application context
  const app = await NestFactory.createApplicationContext(AppModule);

  // 2️⃣ Get the Slider model from Nest's DI container
  const sliderModel = app.get<Model<SliderDocument>>(getModelToken(Slider.name));

  // 3️⃣ Prepare slider data
  const sliders: CreateSliderDto[] = [
    {
      title: 'Summer Collection',
      subtitle: 'Discover our latest summer styles',
      image: 'summer-collection.jpg',
      displayOrder: 1,
      isActive: true,
      isButtonEnabled: true,
      button: {
        title: 'Shop Now',
        textColor: '#ffffff',
        bgColor: '#ff6b6b',
        link: '/category/summer',
      },
    },
    {
      title: 'New Arrivals',
      subtitle: 'Check out our newest products',
      image: 'new-arrivals.jpg',
      displayOrder: 2,
      isActive: true,
      isButtonEnabled: true,
      button: {
        title: 'Explore',
        textColor: '#ffffff',
        bgColor: '#4dabf7',
        link: '/new-arrivals',
      },
    },
    {
      title: 'Special Offers',
      subtitle: 'Limited time discounts on selected items',
      image: 'special-offers.jpg',
      displayOrder: 3,
      isActive: true,
      isButtonEnabled: true,
      button: {
        title: 'View Deals',
        textColor: '#ffffff',
        bgColor: '#40c057',
        link: '/special-offers',
      },
    },
    {
      title: 'Accessories Collection',
      subtitle: 'Complete your look with our accessories',
      image: 'accessories.jpg',
      displayOrder: 4,
      isActive: true,
      isButtonEnabled: true,
      button: {
        title: 'Shop Accessories',
        textColor: '#ffffff',
        bgColor: '#7950f2',
        link: '/category/accessories',
      },
    },
  ];

  // 4️⃣ Seed each slider
  for (const sliderData of sliders) {
    // Since sliders don't have a unique identifier like slug, we'll check by title and image
    const existing = await sliderModel.findOne({ 
      title: sliderData.title,
      image: sliderData.image
    });

    if (existing) {
      console.log(`⚠️  Slider "${sliderData.title}" already exists, skipping.`);
    } else {
      // Create new slider
      const created = await sliderModel.create(sliderData);
      console.log(`✅ Slider seeded successfully: ${created.title}`);
    }
  }

  // 5️⃣ Close the Nest app context
  await app.close();
  console.log('🌱 Sliders seeding completed');
}

bootstrap();
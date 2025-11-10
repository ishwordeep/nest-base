import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { HomepageSection, HomepageSectionDocument } from 'src/homepage-section/schema/create.schema';
import { CreateHomepageSectionDto } from 'src/homepage-section/dto/create.dto';

async function bootstrap() {
  // 1️⃣ Create Nest application context
  const app = await NestFactory.createApplicationContext(AppModule);

  // 2️⃣ Get the HomepageSection model from Nest's DI container
  const homepageSectionModel = app.get<Model<HomepageSectionDocument>>(getModelToken(HomepageSection.name));

  // 3️⃣ Prepare homepage section data
  const sections: CreateHomepageSectionDto[] = [
    {
      slug: 'discover-your-style',
      title: 'Discover Your Style',
      subtitle: 'Explore curated collections to express your individuality.',
      caption: 'Find the perfect pieces to match your unique fashion sense.',
      sortOrder: 1,
      isActive: true,
    },
    {
      slug: 'new-arrivals',
      title: 'New Arrivals',
      subtitle: 'Check out the latest additions to our collection.',
      caption: 'Fresh styles just landed!',
      sortOrder: 2,
      isActive: true,
    },
    {
      slug: 'trending-now',
      title: 'Trending Now',
      subtitle: 'See what’s hot this season.',
      caption: 'Popular picks everyone’s talking about.',
      sortOrder: 3,
      isActive: true,
    },
    {
      slug: 'featured-picks',
      title: 'Featured Picks',
      subtitle: 'Handpicked by our style curators.',
      caption: 'Spotlight on standout pieces.',
      sortOrder: 4,
      isActive: true,
    },
    {
      slug: 'shop-by-categories',
      title: 'Shop By Categories',
      subtitle: 'Browse by your favorite category.',
      caption: 'From clothing to accessories — we’ve got you covered.',
      sortOrder: 5,
      isActive: true,
    },
  ];

  // 4️⃣ Seed each section
  for (const sectionData of sections) {
    // Check if section already exists
    const existing = await homepageSectionModel.findOne({ slug: sectionData.slug });

    if (existing) {
      console.log(`⚠️  Section "${sectionData.title}" already exists, skipping.`);
    } else {
      // Create new section
      const created = await homepageSectionModel.create(sectionData);
      console.log(`✅ Section seeded successfully: ${created.title}`);
    }
  }

  // 5️⃣ Close the Nest app context
  await app.close();
  console.log('🌱 Homepage sections seeding completed');
}

bootstrap();
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { Model } from 'mongoose'; 
import { getModelToken } from '@nestjs/mongoose';
import { About, AboutDocument } from 'src/setting/schema/about.schema';
import { CreateAboutDto } from 'src/setting/dto/about.dto';

async function bootstrap() {
  // 1️⃣ Create Nest application context
  const app = await NestFactory.createApplicationContext(AppModule);

  // 2️⃣ Get the About model from Nest's DI container
  const aboutModel = app.get<Model<AboutDocument>>(getModelToken(About.name));

  // 3️⃣ Prepare your about page data
  const dto: CreateAboutDto = {
    hero: {
      mainTitle: "About UrbanThreads",
      subtitle: "Redefining fashion since 2010",
      buttonText: "Explore Our Collections",
      stats: [
        {
          number: "15+",
          label: "Years Experience"
        },
        {
          number: "50K+",
          label: "Happy Customers"
        },
        {
          number: "100+",
          label: "Fashion Awards"
        }
      ]
    },
    statements: [
      {
        icon: "i-lucide-target",
        iconBackgroundColor: "#e6f7ff",
        title: "Our Mission",
        description: "To provide high-quality, sustainable fashion that empowers individuals to express their unique style while minimizing environmental impact."
      },
      {
        icon: "i-lucide-eye",
        iconBackgroundColor: "#f6ffed",
        title: "Our Vision",
        description: "To become the leading sustainable fashion brand globally, setting new standards for ethical practices in the industry."
      }
    ],
    productStory: [
      {
        year: 2010,
        milestoneTitle: "Founded in Los Angeles",
        description: "UrbanThreads was established with a focus on urban streetwear."
      },
      {
        year: 2015,
        milestoneTitle: "Sustainable Initiative Launch",
        description: "Introduced our first fully sustainable clothing line."
      },
      {
        year: 2020,
        milestoneTitle: "Global Expansion",
        description: "Opened flagship stores in major fashion capitals worldwide."
      },
      {
        year: 2023,
        milestoneTitle: "Digital Transformation",
        description: "Launched our innovative e-commerce platform and virtual try-on technology."
      }
    ],
    team: [
      {
        name: "Alex Johnson",
        titleRole: "Founder & CEO",
        shortBio: "Fashion industry veteran with over 20 years of experience.",
        imageUrl: "https://cdn.urbanthreads.com/team/alex-johnson.jpg"
      },
      {
        name: "Maya Rodriguez",
        titleRole: "Creative Director",
        shortBio: "Award-winning designer with a passion for sustainable fashion.",
        imageUrl: "https://cdn.urbanthreads.com/team/maya-rodriguez.jpg"
      },
      {
        name: "David Chen",
        titleRole: "Head of Sustainability",
        shortBio: "Environmental scientist turned fashion sustainability expert.",
        imageUrl: "https://cdn.urbanthreads.com/team/david-chen.jpg"
      }
    ],
    coreValues: [
      {
        icon: "i-lucide-leaf",
        color: "#52c41a",
        title: "Sustainability",
        description: "We're committed to reducing our environmental footprint through responsible sourcing and production."
      },
      {
        icon: "i-lucide-heart",
        color: "#f5222d",
        title: "Inclusivity",
        description: "We design for everyone, celebrating diversity in all its forms."
      },
      {
        icon: "i-lucide-star",
        color: "#faad14",
        title: "Quality",
        description: "We never compromise on quality, ensuring our products stand the test of time."
      },
      {
        icon: "i-lucide-refresh-cw",
        color: "#1890ff",
        title: "Innovation",
        description: "We constantly push boundaries to bring fresh ideas to the fashion industry."
      }
    ]
  };

  // 4️⃣ Check if an about page already exists
  const existing = await aboutModel.findOne({}, {}, { sort: { createdAt: -1 } });
  if (existing) {
    console.log('⚠️  About page already exists, skipping seeding.');
  } else {
    // 5️⃣ Create new record
    const created = await aboutModel.create(dto);
    console.log('✅ About page seeded successfully!');
  }

  // 6️⃣ Close the Nest app context
  await app.close();
}

bootstrap();
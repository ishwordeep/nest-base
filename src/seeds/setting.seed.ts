import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'; 
import { getModelToken } from '@nestjs/mongoose';
import { Setting, SettingDocument } from 'src/setting/schema/create.schema';
import { CreateSettingDto } from 'src/setting/dto/create.dto';

async function bootstrap() {
  // 1️⃣ Create Nest application context
  const app = await NestFactory.createApplicationContext(AppModule);

  // 2️⃣ Get the Setting model from Nest’s DI container
  const settingModel = app.get<Model<SettingDocument>>(getModelToken(Setting.name));

  // 3️⃣ Prepare your company data
  const dto: CreateSettingDto = {
    name: 'UrbanThreads Clothing',
    email: 'support@urbanthreads.com',
    phone: '+1 (555) 987-6543',
    address: '123 Fashion Avenue',
    city: 'Los Angeles',
    state: 'California',
    country: 'USA',
    postalCode: '90015',
    logoUrl: 'https://cdn.urbanthreads.com/assets/logo.png',
    faviconUrl: 'https://cdn.urbanthreads.com/assets/favicon.ico',
    facebook: 'https://www.facebook.com/urbanthreads',
    instagram: 'https://www.instagram.com/urbanthreads',
    tiktok: 'https://www.tiktok.com/@urbanthreads'
  };

  // 4️⃣ Check if a setting already exists
  const existing = await settingModel.findOne({}, {}, { sort: { createdAt: -1 } });
  if (existing) {
    console.log('⚠️  Setting already exists, skipping seeding.');
  } else {
    // 5️⃣ Create new record
    const created = await settingModel.create(dto);
    console.log('✅ Setting seeded successfully:', created.name);
  }

  // 6️⃣ Close the Nest app context
  await app.close();
}

bootstrap();

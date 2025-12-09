import { Module } from '@nestjs/common';
import { SettingService } from './setting.service';
import { SettingController } from './setting.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Setting, SettingSchema } from './schema/create.schema';
import { About, AboutSchema } from './schema/about.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Setting.name, schema: SettingSchema },
    { name: About.name, schema: AboutSchema }
  ])],
  controllers: [SettingController],
  providers: [SettingService],
  exports:[SettingService]
})
export class SettingModule { }

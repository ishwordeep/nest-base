import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HomepageSectionService } from './homepage-section.service';
import { HomepageSectionController } from './homepage-section.controller';
import { HomepageSection, HomepageSectionSchema } from './schema/create.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: HomepageSection.name, schema: HomepageSectionSchema }])],
  controllers: [HomepageSectionController],
  providers: [HomepageSectionService],
  exports: [MongooseModule, HomepageSectionService]
})
export class HomepageSectionModule {}

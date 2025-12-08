import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactService } from './contact.service'; 
import { ContactMessage, ContactMessageSchema } from './schema/contact.schema';
import { PublicContactController } from './controllers/public.controller';
import { AdminContactController } from './controllers/admin.controller';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContactMessage.name, schema: ContactMessageSchema },
    ]),
  ],
  controllers: [PublicContactController, AdminContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}

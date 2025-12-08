import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ContactService } from '../contact.service';
import { CreateContactDto } from '../dto/create-contact.dto';

@Controller('contact')
export class PublicContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateContactDto) {
    const msg = await this.contactService.createPublic(dto);

    return {
      id: msg._id,
      message: 'Your message has been received. We will contact you soon.',
    };
  }
}

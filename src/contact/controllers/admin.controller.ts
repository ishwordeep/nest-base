import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContactService } from '../contact.service';
import { QueryContactDto } from '../dto/query-contact.dto';
import { UpdateContactAdminDto } from '../dto/update-contact-admin.dto';

// TODO: replace with your real guards/decorators
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard'; 
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/user/schema/user.schema';

@Controller('admin/contact-messages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  async list(@Query() query: QueryContactDto) {
    return this.contactService.findAllAdmin(query);
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    return this.contactService.findOneAdmin(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContactAdminDto,
  ) {
    return this.contactService.updateAdmin(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.contactService.removeAdmin(id);
    return { message: 'Deleted successfully' };
  }
}

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SettingService } from './setting.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/user/schema/user.schema';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateSettingDto } from './dto/create.dto';
import { User } from 'src/decorators/user.decorator';

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createSettingDto: CreateSettingDto, @User('_id') userId: string) {
    return this.settingService.create(createSettingDto)
  }
}

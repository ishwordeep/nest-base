import { Body, Controller, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { SettingService } from './setting.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/user/schema/user.schema';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateSettingDto } from './dto/create.dto';
import { User } from 'src/decorators/user.decorator';
import { UpdateSettingDto } from './dto/update.dto';
import { CreateAboutDto, UpdateAboutDto } from './dto/about.dto';

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createSettingDto: CreateSettingDto, @User('_id') userId: string) {
    return this.settingService.create(createSettingDto)
  }

  @Get()
  async getTop() {
    return this.settingService.findOne();
  }


  @Get('about')
  getAbout() {
    return this.settingService.getAbout();
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('about')
  updateAbout(@Body() updateAboutDto: UpdateAboutDto) {
    return this.settingService.updateAbout(updateAboutDto);
  }

  

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async updateById(@Param('id') id: string, @Body() dto: UpdateSettingDto) {
    return this.settingService.update(id, dto);
  }

  
  

}

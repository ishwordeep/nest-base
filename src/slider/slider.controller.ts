import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { SliderService } from './slider.service';
import { CreateSliderDto } from './dto/create.dto';
import { UpdateSliderDto } from './dto/update.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/user/schema/user.schema';
import { PaginatedResponseDto, PaginationQueryDto } from './dto/pagination.dto';
import { Slider } from './schema/create.schema';

@Controller('slider')
export class SliderController {
  constructor(private readonly sliderService: SliderService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createSliderDto: CreateSliderDto) {
    return this.sliderService.create(createSliderDto);
  }

  @Get()
  async findAll(
    @Query('activeOnly') activeOnly?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: 'displayOrder' | 'createdAt',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<PaginatedResponseDto<Slider>> {
    const isActiveOnly = activeOnly === 'true';
    return this.sliderService.findAll(
      isActiveOnly,
      Number(page) || 1,
      Number(limit) || 10,
      sortBy || 'displayOrder',
      sortOrder || 'asc'
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.sliderService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateSliderDto: UpdateSliderDto) {
    return this.sliderService.update(id, updateSliderDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.sliderService.remove(id);
  }



}

import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { HomepageSectionService } from './homepage-section.service';
import { CreateHomepageSectionDto } from './dto/create.dto';
import { UpdateHomepageSectionDto } from './dto/update.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/user/schema/user.schema';

@Controller('homepage-section')
export class HomepageSectionController {
  constructor(private readonly homepageSectionService: HomepageSectionService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createHomepageSectionDto: CreateHomepageSectionDto) {
    return this.homepageSectionService.create(createHomepageSectionDto);
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.homepageSectionService.findOne(idOrSlug);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('sortBy') sortBy?: 'sortOrder' | 'createdAt' | 'title' | 'slug',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.homepageSectionService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      search,
      isActive: typeof isActive === 'string' ? isActive === 'true' : undefined,
      sortBy,
      sortOrder,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateHomepageSectionDto: UpdateHomepageSectionDto,
  ) {
    return await this.homepageSectionService.update(id, updateHomepageSectionDto);
  }
}

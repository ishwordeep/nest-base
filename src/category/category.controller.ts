import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/user/schema/user.schema';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User } from 'src/decorators/user.decorator';
import { CreateCategoryDto } from './dto/create.dto';
import { UpdateCategoryDto } from './dto/update.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto)
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.categoryService.findOne(idOrSlug);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('sortBy') sortBy?: 'displayOrder' | 'createdAt' | 'name' | 'slug',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.categoryService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      search,
      isActive: typeof isActive === 'string' ? isActive === 'true' : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto:UpdateCategoryDto,
  ) {
    return await this.categoryService.update(id, updateCategoryDto);
   
  }

}

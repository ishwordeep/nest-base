import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/user/schema/user.schema';
import { CreateProductDto } from './dto/create.dto';
import { UpdateProductDto } from './dto/update.dto';
import { UpdateProductFlagDto } from './dto/update-flags.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productService.update(id, updateProductDto);

  }

  @Get('listonly')
  async getActiveIdName(@Query('search') search?: string) {
    return this.productService.listActiveIdName(search);
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.productService.findOne(idOrSlug);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('category') category?: string, // category id or slug
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('tags') tags?: string,   // comma-separated
    @Query('colors') colors?: string, // comma-separated
    @Query('sizes') sizes?: string,  // comma-separated
    @Query('isFeatured') isFeatured?: string,
    @Query('isNew') isNew?: string,
    @Query('isTrending') isTrending?: string,
    @Query('sortBy') sortBy?: 'displayOrder' | 'createdAt' | 'name' | 'slug' | 'price',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.productService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      search,
      category,
      minPrice: typeof minPrice === 'string' ? Number(minPrice) : (minPrice ?? undefined),
      maxPrice: typeof maxPrice === 'string' ? Number(maxPrice) : (maxPrice ?? undefined),
      tags: tags?.split(',').map(s => s.trim()).filter(Boolean),
      colors: colors?.split(',').map(s => s.trim()).filter(Boolean),
      sizes: sizes?.split(',').map(s => s.trim()).filter(Boolean),
      isActive: typeof isActive === 'string' ? isActive === 'true' : undefined,
      isFeatured: typeof isFeatured === 'string' ? isFeatured === 'true' : undefined,
      isNew: typeof isNew === 'string' ? isNew === 'true' : undefined,
      isTrending: typeof isTrending === 'string' ? isTrending === 'true' : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Get('flag/:flag')
  getProductsByFlag(@Param('flag') flag: 'new' | 'trending' | 'featured') {
    return this.productService.getProductsByFlag(flag);
  }


  @Patch('update/:flag')
  updateFlag(
    @Param('flag') flag: 'new' | 'trending' | 'featured',
    @Body() dto: UpdateProductFlagDto,
  ) {
    return this.productService.updateFlag(dto.ids, flag);
  }

  @Get('category/:categoryId')
  async listByCategory(@Param('categoryId') categoryId: string) {
    return this.productService.listByCategoryBasic(categoryId);
  }


}

import { Controller, Get, Param, Query } from '@nestjs/common';
import { FrontendProductService } from './product.service';

@Controller('frontend/product')
export class FrontendProductController {
  constructor(private readonly productService: FrontendProductService) {}

  // @Get(':idOrSlug')
  // async findOne(@Param('idOrSlug') idOrSlug: string) {
  //   return this.productService.findOne(idOrSlug);
  // }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string, // category id or slug
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('tags') tags?: string,   // comma-separated
    @Query('colors') colors?: string, // comma-separated
    @Query('sizes') sizes?: string,  // comma-separated
    @Query('isFeatured') isFeatured?: string,
    @Query('isNew') isNew?: string,
    @Query('isTrending') isTrending?: string,
    @Query('sortBy') sortBy?: string,
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
      isFeatured: typeof isFeatured === 'string' ? isFeatured === 'true' : undefined,
      isNew: typeof isNew === 'string' ? isNew === 'true' : undefined,
      isTrending: typeof isTrending === 'string' ? isTrending === 'true' : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Get('flag/:flag')
  async getProductsByFlag(@Param('flag') flag: 'new' | 'trending' | 'featured') {
    return this.productService.getProductsByFlag(flag);
  }

  @Get('category/:categoryIdOrSlug')
  async listByCategoryBasic(@Param('categoryIdOrSlug') categoryIdOrSlug: string) {
    return this.productService.listByCategoryBasic(categoryIdOrSlug);
  }
}
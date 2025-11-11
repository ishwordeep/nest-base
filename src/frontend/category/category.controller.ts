import { Controller, Get, Param, Query } from '@nestjs/common';
import { FrontendCategoryService } from './category.service';

@Controller('frontend/category')
export class FrontendCategoryController {
  constructor(private readonly categoryService: FrontendCategoryService) {}

  @Get(':idOrSlug')
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.categoryService.findOne(idOrSlug);
  }

  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }
}

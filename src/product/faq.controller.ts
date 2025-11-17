import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { FaqService } from './faq.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/user/schema/user.schema';
import { CreateFaqItemDto, CreateProductFaqDto } from './dto/create-faq.dto';

@Controller('product')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

 

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':productId/faq')
  async addFaqToProduct(
    @Param('productId') productId: string,
    @Body() faqDto: CreateFaqItemDto,
  ) {
    return this.faqService.addFaqToProduct(productId, faqDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':productId/faq/:faqId')
  async updateFaq(
    @Param('productId') productId: string,
    @Param('faqId') faqId: string,
    @Body() faqDto: CreateFaqItemDto,
  ) {
    return this.faqService.updateFaq(productId, faqId, faqDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':productId/faq/:faqId')
  async deleteFaq(
    @Param('productId') productId: string,
    @Param('faqId') faqId: string,
  ) {
    return this.faqService.deleteFaq(productId, faqId);
  }

  @Get(':productId/faq')
  async getFaqs(@Param('productId') productId: string) {
    return this.faqService.getFaqs(productId);
  }
}
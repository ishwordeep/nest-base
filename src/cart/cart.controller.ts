import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create.dto';
import { Cart } from './schema/create.schema';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async create(@Body() createCartDto: CreateCartDto): Promise<Cart> {
    return this.cartService.create(createCartDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Cart> {
    return this.cartService.findOne(id);
  }
}

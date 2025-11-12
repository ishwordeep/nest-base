import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create.dto';
import { Cart } from './schema/create.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Types } from 'mongoose';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCartDto: CreateCartDto, @Request() req){
    // Extract userId from JWT token
    const userId = new Types.ObjectId(req.user.sub);

    // Override userId in DTO with the one from token
    createCartDto.userId = userId;

    return this.cartService.create(createCartDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findByUserId(@Request() req) {
    // Extract userId from JWT token
    const userId = req.user.sub;
    return this.cartService.findByUserId(userId);
  }

 
}

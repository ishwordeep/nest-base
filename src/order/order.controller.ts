import { Body, Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Create a new order
   * POST /order
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    // Extract userId from authenticated request
    // Use type assertion to tell TypeScript that req.user has a 'sub' property
    const userId = (req as any).user?.sub;
    // Add userId to the order data
    createOrderDto.userId = userId;
    return this.orderService.create(createOrderDto);
  }

  /**
   * Get an order by ID
   * GET /order/:id
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }
}

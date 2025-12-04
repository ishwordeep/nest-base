import { Body, Controller, Get, Param, Post, Query, UseGuards, Request } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { FilterOrdersDto } from './dto/filter-orders.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/user/schema/user.schema';
import { RolesGuard } from 'src/auth/guards/roles.guard';

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
    console.log(createOrderDto,userId);
    return this.orderService.create(createOrderDto);
  }

  /**
   * Get all orders for the authenticated user with optional status filtering
   * GET /order/user/me?status=PAID
   */
  @UseGuards(JwtAuthGuard)
  @Get('user')
  async findUserOrders(@Query() filterDto: FilterOrdersDto, @Request() req) {
    // Extract userId from authenticated request
    const userId = (req as any).user?.sub;
    console.log("findUserOrders:",userId);
    return this.orderService.findUserOrders(userId, filterDto);
  }

  /**
   * Get all orders with optional filtering (admin only)
   * GET /order/admin?status=PAID
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin')
  async findAllOrders(@Query() filterDto: FilterOrdersDto) {
    return this.orderService.findAllOrders(filterDto);
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

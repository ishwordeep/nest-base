import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, Request, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { FilterOrdersDto } from './dto/filter-orders.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/user/schema/user.schema';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { StripeService } from 'src/stripe/stripe.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import Stripe from 'stripe';
import { OrderStatus, PaymentStatus } from './schema/create.schema';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly stripeService: StripeService,
  ) { }

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
    // console.log(createOrderDto,userId);
    return this.orderService.create(createOrderDto, userId);
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
    console.log("findUserOrders:", userId);
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

  @UseGuards(JwtAuthGuard)
  @Post(':id/payment-intent')
  async createPaymentIntentForOrder(@Param('id') orderId: string, @Request() req) {
    const order = await this.orderService.findOne(orderId);
    if (!order) throw new NotFoundException('Order not found');

    const userId = (req as any).user?.sub;
    if (order.userId?.toString() !== userId) throw new ForbiddenException();

    // If order already paid, don't create/reuse a PI
    if (order.status === OrderStatus.PAID || order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order is already paid');
    }

    // If we already have a PaymentIntent stored, try to reuse it
    if (order.paymentIntentId) {
      let existingPi: Stripe.PaymentIntent;

      try {
        existingPi = await this.stripeService.retrievePaymentIntent(order.paymentIntentId);
      } catch (e: any) {
        // If PI doesn't exist anymore, clear and create a new one
        await this.orderService.clearPaymentIntent(orderId);
        existingPi = null as any;
      }

      if (existingPi) {
        const reusableStatuses: Stripe.PaymentIntent.Status[] = [
          'requires_payment_method',
          'requires_confirmation',
          'requires_action',
          'processing',
        ];

        if (reusableStatuses.includes(existingPi.status)) {
          if (!existingPi.client_secret) {
            throw new BadRequestException('PaymentIntent missing client_secret');
          }

          return {
            orderId,
            paymentIntentId: existingPi.id,
            clientSecret: existingPi.client_secret,
            amount: existingPi.amount,
            currency: existingPi.currency,
            reused: true,
            status: existingPi.status,
          };
        }

        // not reusable -> clear and continue to create fresh
        await this.orderService.clearPaymentIntent(orderId);
      }
    }


    // 2) Create a fresh PaymentIntent
    const newPi = await this.stripeService.createPaymentIntentForOrder(order);

    // 3) Store only the PaymentIntent ID on the order
    await this.orderService.attachPaymentIntent(orderId, newPi.id);

    if (!newPi.client_secret) {
      throw new BadRequestException('PaymentIntent missing client_secret');
    }

    return {
      orderId,
      paymentIntentId: newPi.id,
      clientSecret: newPi.client_secret,
      amount: newPi.amount,
      currency: newPi.currency,
      reused: false,
      status: newPi.status,
    };
  }

  /**
   * Update the status of an order (admin only)
   * PATCH /order/:id/status
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto
  ) {
    return this.orderService.updateOrderStatus(id, updateOrderStatusDto);
  }
}

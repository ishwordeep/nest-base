import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schema/create.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { FilterOrdersDto } from './dto/filter-orders.dto';
import { generateOrderNumber } from 'src/common/utils/order-number.util';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) { }

  private async generateUniqueOrderNumber(): Promise<string> {
    const MAX_TRIES = 10;

    for (let i = 0; i < MAX_TRIES; i++) {
      const orderNumber = generateOrderNumber(); // <-- util generating

      const exists = await this.orderModel.exists({ orderNumber });

      if (!exists) {
        return orderNumber; // unique
      }
    }

    throw new InternalServerErrorException(
      'Could not generate a unique order number. Please try again.',
    );
  }

   async create(createOrderDto: CreateOrderDto, userId?: string) {
    // 1) generate unique, human-readable order number
    const orderNumber = await this.generateUniqueOrderNumber();

    // 2) compute subtotal from items (ignore any client-sent subtotal)
    const subtotal = createOrderDto.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    // 3) backend-controlled discount & shipping
    //    (for now use values from DTO if present, otherwise 0)
    const discountTotal = createOrderDto.discountTotal ?? 0;
    const shippingFee = createOrderDto.shippingFee ?? 0;

    // 4) compute grand total (ignore any client-sent grandTotal)
    const grandTotal = subtotal - discountTotal + shippingFee;

    const createdOrder = new this.orderModel({
      // spread first so our computed values overwrite whatever came from client
      ...createOrderDto,
      userId: userId ? new Types.ObjectId(userId) : undefined,
      orderNumber,
      subtotal,
      discountTotal,
      shippingFee,
      grandTotal,
      status: OrderStatus.PENDING_PAYMENT, // always start as pending for payment
    });

    return createdOrder.save();
  }
  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * Find all orders for a specific user with optional status filtering
   * @param userId The ID of the user
   * @param filterDto Optional filter criteria
   * @returns Array of orders
   */
  async findUserOrders(userId: string, filterDto?: FilterOrdersDto): Promise<Order[]> {
    // Start with base query for user's orders
    const query = this.orderModel.find({ 
      userId: new Types.ObjectId(userId),
    });

    // Apply status filter if provided
    if (filterDto?.status) {
      query.where('status').equals(filterDto.status);
    }

    // Sort by most recent first
    query.sort({ createdAt: -1 });

    // Execute query
    return query.exec();
  }
}

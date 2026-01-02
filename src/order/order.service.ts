import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schema/create.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { FilterOrdersDto } from './dto/filter-orders.dto';
import { generateOrderNumber } from 'src/common/utils/order-number.util';
import { CartService } from 'src/cart/cart.service';
import { PaymentStatus } from './schema/create.schema';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';


@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly cartService: CartService
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
      orderNumber,
      subtotal,
      discountTotal,
      shippingFee,
      grandTotal,
      status: OrderStatus.PENDING_PAYMENT, // always start as pending for payment
    });

    // Save the order
    const savedOrder = await createdOrder.save();


    // Only empty the cart if userId is provided
    console.log(createOrderDto.userId);
    if (createOrderDto.userId) {
      await this.cartService.emptyCart(createOrderDto.userId);
    }

    return savedOrder;
  }
  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * Find all orders for a specific user with optional status filtering and pagination
   * @param userId The ID of the user
   * @param filterDto Optional filter criteria and pagination options
   * @returns Object containing orders array, pagination info (including total count), and statusCounts
   */
  // async findUserOrders(
  //   userId: string, 
  //   filterDto?: FilterOrdersDto
  // ): Promise<{
  //   data: Order[];
  //   pagination: any;
  //   statusCounts: Record<string, number>;
  // }> {
  //   // Start with base query for user's orders
  //   const filter = {
  //     userId: userId,
  //   };

  //   // Extract pagination parameters with defaults
  //   const page = Math.max(1, filterDto?.page || 1);
  //   const limit = Math.max(1, filterDto?.limit || 10);
  //   const skip = (page - 1) * limit;

  //   // Apply status filter if provided
  //   if (filterDto?.status) {
  //     filter['status'] = filterDto.status;
  //   }

  //   // Execute query and count in parallel
  //   const [data, total] = await Promise.all([
  //     this.orderModel.find(filter)
  //       .sort({ createdAt: -1 })
  //       .skip(skip)
  //       .limit(limit)
  //       .exec(),
  //     this.orderModel.countDocuments(filter)
  //   ]);

  //   // Aggregate counts by status for this user
  //   // Create a match filter that includes userId and status if provided
  //   const matchFilter: any = { userId: new Types.ObjectId(userId) };

  //   // Only apply status filter to the aggregation if it's provided in the filterDto
  //   if (filterDto?.status) {
  //     matchFilter.status = filterDto.status;
  //   }

  //   const statusAggregation = await this.orderModel.aggregate([
  //     {
  //       $match: matchFilter
  //     },
  //     {
  //       $group: {
  //         _id: '$status',
  //         count: { $sum: 1 }
  //       }
  //     }
  //   ]);

  //   // Normalize counts
  //   const statusCounts: Record<string, number> = {
  //     ALL: 0,
  //     [OrderStatus.PENDING_PAYMENT]: 0,
  //     [OrderStatus.PAID]: 0,
  //     [OrderStatus.SHIPPED]: 0,
  //     [OrderStatus.COMPLETED]: 0,
  //     [OrderStatus.CANCELLED]: 0,
  //   };

  //   // Get total count of all orders for this user (without status filter)
  //   const totalCount = await this.orderModel.countDocuments({ userId: new Types.ObjectId(userId) });
  //   statusCounts.ALL = totalCount;

  //   // Update individual status counts from aggregation
  //   statusAggregation.forEach(item => {
  //     if (statusCounts[item._id] !== undefined) {
  //       statusCounts[item._id] = item.count;
  //     }
  //   });

  //   console.log("User statusCounts:", statusCounts);

  //   // Return data, pagination info with total count, and statusCounts
  //   return {
  //     data,
  //     pagination: {
  //       page,
  //       limit,
  //       pages: Math.ceil(total / limit) || 1,
  //       total
  //     },
  //     statusCounts
  //   };
  // }
  async findUserOrders(
  userId: string,
  filterDto?: FilterOrdersDto
): Promise<{
  data: Order[];
  pagination: any;
  statusCounts: Record<string, number>;
}> {

  // --------------------------------
  // 1️⃣ Base filter for user orders
  // --------------------------------
  const filter: any = {
    userId: userId, // ✅ STRING (matches schema)
  };

  if (filterDto?.status) {
    filter.status = filterDto.status;
  }

  // --------------------------------
  // 2️⃣ Pagination
  // --------------------------------
  const page = Math.max(1, filterDto?.page || 1);
  const limit = Math.max(1, filterDto?.limit || 10);
  const skip = (page - 1) * limit;

  // --------------------------------
  // 3️⃣ Fetch orders & total
  // --------------------------------
  const [data, total] = await Promise.all([
    this.orderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),

    this.orderModel.countDocuments(filter)
  ]);

  // --------------------------------
  // 4️⃣ Aggregate status counts (USER WISE)
  // --------------------------------
  const statusAggregation = await this.orderModel.aggregate([
    {
      $match: {
        userId: userId // ✅ STRING
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // --------------------------------
  // 5️⃣ Normalize counts
  // --------------------------------
  const statusCounts: Record<string, number> = {
    ALL: 0,
    [OrderStatus.PENDING_PAYMENT]: 0,
    [OrderStatus.PAID]: 0,
    [OrderStatus.SHIPPED]: 0,
    [OrderStatus.COMPLETED]: 0,
    [OrderStatus.CANCELLED]: 0,
  };

  statusAggregation.forEach(item => {
    if (statusCounts[item._id] !== undefined) {
      statusCounts[item._id] = item.count;
      statusCounts.ALL += item.count;
    }
  });

  // --------------------------------
  // 6️⃣ Response (unchanged)
  // --------------------------------
  return {
    data,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
      total
    },
    statusCounts
  };
}


  /**
   * Find all orders with optional filtering and pagination (for admin use)
   * @param filterDto Optional filter criteria and pagination options
   * @returns Object containing orders array, pagination info (including total count), and statusCounts
   */
  // async findAllOrders(filterDto?: FilterOrdersDto): Promise<{ data: Order[], pagination?: any }> {
  //   // Start with base query for all orders
  //   const filter = {};

  //   // Extract pagination parameters with defaults
  //   const page = filterDto?.page || 1;
  //   const limit = filterDto?.limit || 10;
  //   const skip = (Math.max(1, page) - 1) * Math.max(1, limit);

  //   // Apply status filter if provided
  //   if (filterDto?.status) {
  //     filter['status'] = filterDto.status;
  //   }

  //   // Execute query and count in parallel
  //   const [data, total] = await Promise.all([
  //     this.orderModel.find(filter)
  //       .sort({ createdAt: -1 })
  //       .skip(skip)
  //       .limit(limit)
  //       .exec(),
  //     this.orderModel.countDocuments(filter)
  //   ]);

  //   // Return data and pagination info with total count
  //   return { 
  //     data, 
  //     pagination: {
  //       page: Math.max(1, page),
  //       limit: Math.max(1, limit),
  //       pages: Math.ceil(total / Math.max(1, limit)) || 1,
  //       total
  //     }
  //   };
  // }
  async findAllOrders(
    filterDto?: FilterOrdersDto
  ): Promise<{
    data: Order[];
    pagination: any;
    statusCounts: Record<string, number>;
  }> {

    // --------------------------------
    // 1️⃣ Build filter for order listing
    // --------------------------------
    const filter: any = {};

    if (filterDto?.status) {
      filter.status = filterDto.status;
    }

    // --------------------------------
    // 2️⃣ Pagination handling (safe)
    // --------------------------------
    const page = Math.max(1, filterDto?.page || 1);
    const limit = Math.max(1, filterDto?.limit || 10);
    const skip = (page - 1) * limit;

    // --------------------------------
    // 3️⃣ Fetch orders & total count
    // --------------------------------
    const [data, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),

      this.orderModel.countDocuments(filter)
    ]);

    // --------------------------------
    // 4️⃣ Aggregate counts by status
    // --------------------------------
    const statusAggregation = await this.orderModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // --------------------------------
    // 5️⃣ Normalize counts (VERY IMPORTANT)
    // --------------------------------
    const statusCounts: Record<string, number> = {
      ALL: 0,
      [OrderStatus.PENDING_PAYMENT]: 0,
      [OrderStatus.PAID]: 0,
      [OrderStatus.SHIPPED]: 0,
      [OrderStatus.COMPLETED]: 0,
      [OrderStatus.CANCELLED]: 0,
    };

    statusAggregation.forEach(item => {
      if (statusCounts[item._id] !== undefined) {
        statusCounts[item._id] = item.count;
        statusCounts.ALL += item.count;
      }
    });

    // --------------------------------
    // 6️⃣ Final response
    // --------------------------------
    console.log("statusCounts:",statusCounts);
    return {
      data,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
        total
      },
      statusCounts
    };
  }



  async markOrderAsPaid(orderId: string, paymentIntentId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) return;

    order.status = OrderStatus.PAID;
    order.paymentStatus = PaymentStatus.PAID;
    order.transactionId = paymentIntentId;

    await order.save();
  }

  async markOrderAsFailed(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) return;

    order.status = OrderStatus.CANCELLED;
    await order.save();
  }

  async attachPaymentIntent(orderId: string, paymentIntentId: string) {
    return this.orderModel.findByIdAndUpdate(
      orderId,
      { paymentIntentId },
      { new: true },
    );
  }

  async clearPaymentIntent(orderId: string) {
    return this.orderModel.findByIdAndUpdate(
      orderId,
      { $unset: { paymentIntentId: 1 } },
      { new: true },
    );
  }


  /**
   * Update the status of an order
   * @param id The ID of the order to update
   * @param updateOrderStatusDto The DTO containing the new status
   * @returns The updated order
   */
  async updateOrderStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    order.status = updateOrderStatusDto.status;

    // If status is PAID, also update payment status
    if (updateOrderStatusDto.status === OrderStatus.PAID) {
      order.paymentStatus = PaymentStatus.PAID;
    }

    const updatedOrder = await order.save();
    return updatedOrder;
  }
}

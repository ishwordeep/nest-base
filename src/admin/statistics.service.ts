import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { OrderService } from '../order/order.service';
import { ProductService } from '../product/product.service';
import { UserRole } from '../user/schema/user.schema';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly userService: UserService,
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
  ) {}

  async getAdminStatistics() {
    // Get all users with CUSTOMER role
    const allUsers = await this.userService.findAll();
    const totalCustomers = allUsers.filter(user => user.role === UserRole.CUSTOMER).length;

    // Get all orders
    const allOrders = await this.orderService.findAllOrders();
    const totalOrders = allOrders.data.length;

    // Calculate total revenue from all orders
    const totalRevenue = allOrders.data.reduce((sum, order) => sum + order.grandTotal, 0);

    // Get all products
    const allProducts = await this.productService.findAll({});
    const totalProducts = allProducts.data.length;

    return {
      success: true,
      data: {
        totalCustomers,
        totalOrders,
        totalProducts,
        totalRevenue,
      },
    };
  }
}

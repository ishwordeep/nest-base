import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schema/create.schema';
import { CreateCartDto } from './dto/create.dto';
import { ProductService } from '../product/product.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    private readonly productService: ProductService,
  ) { }

  async create(createCartDto: CreateCartDto) {
    try {
      // ✅ Validate products
      for (const item of createCartDto.items) {
        try {
          await this.productService.findOne(item.productId.toString());
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw new BadRequestException(
              `Product with ID ${item.productId} does not exist`,
            );
          }
          throw error;
        }
      }

      // ✅ Calculate totals
      let totalPrice = 0;
      let totalDiscount = 0;

      for (const item of createCartDto.items) {
        const price = item.price || 0;
        const discount = item.discount || 0;
        totalPrice += price * item.quantity;
        totalDiscount += discount * item.quantity;
      }

      // ✅ Create and save cart
      const cart = new this.cartModel({
        ...createCartDto,
        totalPrice,
        totalDiscount,
        isOrdered: false,
      });

      await cart.save();

      // ✅ Populate product details and return
      return await this.cartModel
        .findById(cart._id)
        .populate('productDetails')
        .exec();
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }


  async findOne(id: string): Promise<Cart> {
    try {
      // Validate if the id is a valid ObjectId
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid cart ID');
      }

      const cart = await this.cartModel.findById(id)
        .populate('productDetails')
        .exec();

      if (!cart) {
        throw new NotFoundException(`Cart with ID ${id} not found`);
      }

      return cart;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async findByUserId(userId: string): Promise<Cart[]> {
    try {
      // Validate if the userId is a valid ObjectId
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }

      const carts = await this.cartModel.find({ userId: new Types.ObjectId(userId) })
        .populate('productDetails')
        .exec();

      return carts;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }
}

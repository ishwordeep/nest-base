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
    const { userId, productId, quantity, color, size } = createCartDto;

    // 1️⃣ Validate product
    const product = await this.productService.findOne(productId.toString());
    if (!product.isActive) throw new BadRequestException('Product is not available');

    const qty = Math.max(1, Number(quantity ?? 1));
    const price = product.price ?? 0;
    const discount = product.discount ?? 0;

    // 2️⃣ Find or create cart
    let cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      cart = await this.cartModel.create({
        userId,
        items: [
          {
            productId,
            quantity: qty,
            price,
            discount,
            color,
            size,
          },
        ]
      });
    } else {
      // 3️⃣ Merge with existing line
      const idx = cart.items.findIndex(
        (i) =>
          i.productId.toString() === productId.toString() &&
          (i.color ?? null) === (color ?? null) &&
          (i.size ?? null) === (size ?? null),
      );

      if (idx > -1) {
        cart.items[idx].quantity += qty;
        cart.items[idx].price = price;
        (cart.items[idx] as any).discount = discount;
      } else {
        cart.items.push({ productId, quantity: qty, price, discount, color, size } as any);
      }

      await cart.save();
    }

    // 4️⃣ Return populated
    return this.cartModel.findById(cart._id).populate('productDetails').exec();
  } catch (error: any) {
    if (error?.name === 'ValidationError') {
      throw new BadRequestException(error.message);
    }
    throw error;
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

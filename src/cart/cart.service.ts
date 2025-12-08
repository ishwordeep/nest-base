import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schema/create.schema';
import { CreateCartDto } from './dto/create.dto';
import { ProductService } from '../product/product.service';
import { UpdateCartItemQuantityDto } from './dto/update-quantity.dto';

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

    // 2️⃣ Find or create cart
    let cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      cart = await this.cartModel.create({
        userId,
        items: [
          {
            productId,
            quantity: qty,
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
      } else {
        cart.items.push({ productId, quantity: qty, color, size } as any);
      }

      await cart.save();
    }

    // 4️⃣ Return success message and only the newly added item
    // Find the item that was just added or updated
    const addedItemIndex = cart.items.findIndex(
      (i) =>
        i.productId.toString() === productId.toString() &&
        (i.color ?? null) === (color ?? null) &&
        (i.size ?? null) === (size ?? null),
    );

    const addedItem = addedItemIndex > -1 ? cart.items[addedItemIndex] : null;

    // Include product details in the response, similar to findByUserId
    const enhancedItem = addedItem ? {
      _id: addedItem._id,
      productId: addedItem.productId,
      quantity: addedItem.quantity,
      color: addedItem.color,
      size: addedItem.size,
      // Add product fields from the product we already fetched
      name: product.name,
      image: product.image,
      price: product.price,
      discount: product.discount,
    } : null;

    return {
      success: true,
      message: "Item added to cart successfully.",
      data: enhancedItem
    };
  } catch (error: any) {
    if (error?.name === 'ValidationError') {
      throw new BadRequestException(error.message);
    }
    throw error;
  }
}


  async findByUserId(userId: string)/*: Promise<any>*/ {
  try {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Populate only what you need from Product
    const cart = await this.cartModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate({
        path: 'items.productId',
        select: 'name image price discount', // only these fields
      })
      .lean() // easier to reshape the response
      .exec();

    if (!cart) {
      return { data: { data: null } };
    }

    // Shape the response: fold product fields into each item
    const shaped = {
      _id: cart._id,
      userId: cart.userId,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      items: cart.items.map((it: any) => {
        const p = it.productId || {};
        return {
          _id:it._id,
          productId: p._id ?? it.productId, // keep id
          quantity: it.quantity,
          color: it.color,
          size: it.size,
          // product fields inlined from Product model:
          name: p.name,
          image: p.image,
          price: p.price,
          discount: p.discount,
        };
      }),
    };

    return {
      success: true,
      message: "Cart retrieved successfully.",
      data: shaped
    };
  } catch (error: any) {
    if (error instanceof BadRequestException) throw error;
    throw new BadRequestException(error.message);
  }
}

  async deleteItem(userId: string, itemId: string) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }

      const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      // Find the item index in the cart
      const itemIndex = cart.items.findIndex(item => item._id && item._id.toString() === itemId);

      if (itemIndex === -1) {
        throw new NotFoundException('Item not found in cart');
      }

      // Remove the item from the cart
      cart.items.splice(itemIndex, 1);

      // Save the updated cart
      await cart.save();

      return {
        success: true,
        message: 'Item removed from cart successfully'
      };
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }


async updateItemQuantity(dto: UpdateCartItemQuantityDto) {
  try {
    const { userId, itemId, quantity } = dto;

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    if (!Types.ObjectId.isValid(itemId)) {
      throw new BadRequestException('Invalid item ID');
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id && item._id.toString() === itemId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;

    await cart.save();

    const updatedItem = cart.items[itemIndex];
    const product = await this.productService.findOne(updatedItem.productId.toString());

    const enhancedItem = {
      _id: updatedItem._id,
      productId: updatedItem.productId,
      quantity: updatedItem.quantity,
      color: updatedItem.color,
      size: updatedItem.size,
      name: product?.name,
      image: product?.image,
      price: product?.price,
      discount: product?.discount,
    };

    return {
      success: true,
      message: 'Cart item quantity updated successfully.',
      data: enhancedItem,
    };
  } catch (error: any) {
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error;
    }
    throw new BadRequestException(error.message);
  }
}


  async emptyCart(userId: string) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }

      const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });

      if (!cart) {
        return {
          success: true,
          message: 'Cart is already empty'
        };
      }

      // Empty the cart items
      cart.items = [];

      // Save the updated cart
      await cart.save();

      return {
        success: true,
        message: 'Cart emptied successfully'
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

}

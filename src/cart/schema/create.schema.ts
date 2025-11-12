import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop([
    {
      productId: { type: Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1, default: 1 },
      price: { type: Number, required: true, min: 0 }, // base price
      discount: { type: Number, default: 0 },          // per item discount (if any)
      color: { type: String },
      size: { type: String },
    },
  ])
  items: {
    productId: Types.ObjectId;
    quantity: number;
    price: number;
    discount?: number;
    color?: string;
    size?: string;
  }[];
 
}

export const CartSchema = SchemaFactory.createForClass(Cart);



/* ✅ Virtual to populate product details */
CartSchema.virtual('productDetails', {
  ref: 'Product',
  localField: 'items.productId',
  foreignField: '_id',
});

/* ✅ Include virtuals in outputs */
// Disable Mongoose's virtual `id`
CartSchema.set('id', false);

CartSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    // TS-safe because ret is any
    delete ret.id;
    if (Array.isArray(ret.items)) {
      ret.items.forEach((i: any) => delete i.id);
    }
    return ret;
  },
});

CartSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    delete ret.id;
    if (Array.isArray(ret.items)) {
      ret.items.forEach((i: any) => delete i.id);
    }
    return ret;
  },
});


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
      color: { type: String },
      size: { type: String },
    },
  ])
  items: {
    _id?: Types.ObjectId;
    productId: Types.ObjectId;
    quantity: number;
    color?: string;
    size?: string;
  }[];

  // Automatically added by Mongoose with timestamps: true
  createdAt: Date;
  updatedAt: Date;
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

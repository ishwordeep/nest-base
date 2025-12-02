// order.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CARD = 'card',
  APPLE_PAY = 'apple_pay'
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid'
}

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId; // reference to Product

  // snapshot fields (so if product changes later, order still keeps history)
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0 })
  price: number; // final price per item at time of order (after discount)

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ trim: true })
  size?: string;

  @Prop({ trim: true })
  color?: string;

  @Prop()
  image?: string;
}

@Schema({ _id: false })
export class ShippingAddress {
  @Prop({ required: true, trim: true })
  street: string;

  @Prop({ trim: true })
  apartment?: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ required: true, trim: true })
  state: string;

  @Prop({ required: true, trim: true })
  zipCode: string;

  @Prop({ trim: true })
  country?: string;

  @Prop({ default: false })
  isDefault?: boolean;
}

@Schema({ timestamps: true })
export class Order {
  // if you have users
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  // public order code (for showing to customer)
  @Prop({ required: true, unique: true, trim: true })
  orderNumber: string;

  @Prop({ type: [OrderItem], default: [] })
  items: OrderItem[];

  // price breakdown
  @Prop({ required: true, min: 0 })
  subtotal: number; // sum of items price * qty

  @Prop({ default: 0, min: 0 })
  discountTotal: number;

  @Prop({ default: 0, min: 0 })
  shippingFee: number;

  @Prop({ required: true, min: 0 })
  grandTotal: number;

  // shipping
  @Prop({ type: ShippingAddress, required: true })
  shippingAddress: ShippingAddress;

  @Prop({
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  // payment
  @Prop({
    type: String,
    enum: Object.values(PaymentMethod),
  })
  paymentMethod: PaymentMethod;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;

  @Prop({ trim: true })
  transactionId?: string; // from payment gateway

  @Prop({ trim: true })
  notes?: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

/**
 * Virtuals
 */

// ✅ FIX: field name is userId (not user)
OrderSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// ✅ FIX: field name is productId (not product)
OrderSchema.virtual('itemProducts', {
  ref: 'Product',
  localField: 'items.productId',
  foreignField: '_id',
  justOne: false,
});

OrderSchema.set('toObject', { virtuals: true });
OrderSchema.set('toJSON', { virtuals: true });

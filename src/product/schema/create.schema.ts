import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface FAQ {
  _id?: Types.ObjectId;
  question: string;
  answer: string;
}

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  image: string;

  @Prop({ trim: true })
  story: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: false, min: 0 })
  discount: number;

  @Prop({ type: [String], default: [] })
  sizes: string[]; //  e.g. ["S", "M", "L", "XL"]

  @Prop({ type: [String], default: [] })
  colors: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: true })
  isNew: boolean;

  @Prop({ default: false })
  isTrending: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  target_audience: string[];

  @Prop({
    type: [{
      _id: { type: Types.ObjectId },
      question: { type: String },
      answer: { type: String }
    }],
    default: []
  })
  faqs: FAQ[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.virtual('categoryDetails', {
  ref: 'Category',          // The model to populate from
  localField: 'category',   // Field on Product
  foreignField: '_id',      // Field on Category
  justOne: true,            // Expect only one category per product
});

/* ✅ Ensure virtuals are included in JSON and Object outputs */
ProductSchema.set('toObject', { virtuals: true });
ProductSchema.set('toJSON', { virtuals: true });

// to get with category details:
// // product.service.ts
// async findAll() {
//   return this.productModel
//     .find()
//     .populate('categoryDetails') // 👈 auto-fetch category info
//     .exec();
// }

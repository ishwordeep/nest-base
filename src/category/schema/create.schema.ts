import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
    @Prop({ required: true, unique: true, trim: true })
    name: string;

    @Prop({ required: true, unique: true, trim: true })
    slug: string; // e.g. "mens-tshirts"

    @Prop({ trim: true })
    description?: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ trim: true })
    image?: string;

    @Prop({ default: 0 })
    displayOrder: number;

}

export const CategorySchema = SchemaFactory.createForClass(Category);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HomepageSectionDocument = HomepageSection & Document;

@Schema({ timestamps: true })
export class HomepageSection {
    @Prop({ required: true, unique: true, trim: true, lowercase: true })
    slug: string;

    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ trim: true })
    subtitle?: string;

    @Prop({ trim: true })
    caption?: string;

    @Prop({ default: 1 })
    sortOrder: number;

    @Prop({ default: true })
    isActive: boolean;
}

export const HomepageSectionSchema = SchemaFactory.createForClass(HomepageSection);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: true })
export class Company {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, unique: true, trim: true })
    email: string;

    @Prop({ trim: true })
    description: string;

    @Prop({ trim: true })
    phone: string;

    @Prop({ trim: true })
    address: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
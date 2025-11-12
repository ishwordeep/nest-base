import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export enum UserRole {
    ADMIN = 'ADMIN',
    STAFF = 'STAFF',
    USER = 'USER',
    CUSTOMER = 'CUSTOMER'
}

export class ShippingAddress {
    @Prop({ required: false })
    street: string;

    @Prop()
    apartment?: string;

    @Prop({ required: false })
    city: string;

    @Prop({ required: false, minlength: 2, maxlength: 2 })
    state: string;

    @Prop({ required: false })
    zipCode: string;

    @Prop({ default: 'USA' })
    country: string;

    @Prop({ default: false })
    isDefault: boolean;
}
@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, unique: true })
    email: string

    @Prop({ required: true })
    password: string

    @Prop({})
    phone: string

    @Prop({})
    name: string

    @Prop({ type: String, enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Prop({ type: [ShippingAddress], default: [] })
    shippingAddresses: ShippingAddress[];
}
export const UserSchema = SchemaFactory.createForClass(User);

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export enum UserRole {
    ADMIN = 'ADMIN',
    STAFF = 'STAFF',
    USER = 'USER',
    CUSTOMER = 'CUSTOMER'
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

}
export const UserSchema = SchemaFactory.createForClass(User);
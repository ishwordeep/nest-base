import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ContactStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

@Schema({ timestamps: true })
export class ContactMessage {
  _id: string;

  @Prop({ required: true, maxlength: 80 })
  name: string;

  @Prop({ required: true, maxlength: 120, lowercase: true, trim: true })
  email: string;

  @Prop({ required: false, maxlength: 25 })
  phone?: string;

  @Prop({ required: true, maxlength: 100 })
  subject: string;

  @Prop({ required: true, maxlength: 2000 })
  message: string;

  @Prop({
    type: String,
    enum: ContactStatus,
    default: ContactStatus.NEW,
    index: true,
  })
  status: ContactStatus;

  @Prop({ required: false, maxlength: 4000 })
  adminNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type ContactMessageDocument = ContactMessage & Document;

export const ContactMessageSchema =
  SchemaFactory.createForClass(ContactMessage);

// Optional indexes for better admin queries
ContactMessageSchema.index({ status: 1, createdAt: -1 });
ContactMessageSchema.index({
  name: 'text',
  email: 'text',
  subject: 'text',
  message: 'text',
});

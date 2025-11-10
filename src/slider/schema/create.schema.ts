import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SliderDocument = Slider & Document;

// Define the Button interface
class Button {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  textColor: string;

  @Prop({ required: true, trim: true })
  bgColor: string;

  @Prop({trim: true })
  link: string;
}

@Schema({ timestamps: true })
export class Slider {
  @Prop({ required: false, trim: true })
  title: string;

  @Prop({ required: false, trim: true })
  subtitle: string;

  @Prop({ required: true, trim: true })
  image: string;

  @Prop({ required: false, default: 0 })
  displayOrder: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: true })
  isButtonEnabled: boolean;

  @Prop({ type: Button, required: true })
  button: Button;
}

export const SliderSchema = SchemaFactory.createForClass(Slider);

/* ✅ Ensure virtuals are included in JSON and Object outputs */
SliderSchema.set('toObject', { virtuals: true });
SliderSchema.set('toJSON', { virtuals: true });

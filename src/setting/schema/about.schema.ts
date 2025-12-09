// about.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AboutDocument = About & Document;

/* ---------------------- Sub Schemas ---------------------- */

@Schema({ _id: false })
export class Stat {
  @Prop({ required: true })
  number: string; // e.g. "10+", "50K+"

  @Prop({ required: true })
  label: string;  // e.g. "Years Experience"
}
export const StatSchema = SchemaFactory.createForClass(Stat);


@Schema({ _id: false })
export class HeroSection {
  @Prop({ required: true })
  mainTitle: string;

  @Prop()
  subtitle?: string;

  @Prop()
  buttonText?: string;

  @Prop({ type: [StatSchema], default: [] })
  stats: Stat[];
}
export const HeroSectionSchema = SchemaFactory.createForClass(HeroSection);



//mission vison
@Schema({ _id: false })
export class Statement {
  @Prop({ required: true })
  icon: string; // e.g. "i-lucide-target"

  @Prop()
  iconBackgroundColor?: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;
}
export const StatementSchema = SchemaFactory.createForClass(Statement);


@Schema({ _id: false })
export class ProductStoryItem {
  @Prop({ required: true })
  year: string;

  @Prop({ required: true })
  milestoneTitle: string;

  @Prop()
  description?: string;
}
export const ProductStoryItemSchema = SchemaFactory.createForClass(ProductStoryItem);


@Schema({ _id: false })
export class TeamMember {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  titleRole: string;

  @Prop()
  shortBio?: string;

  @Prop()
  imageUrl?: string;
}
export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);


@Schema({ _id: false })
export class CoreValue {
  @Prop({ required: true })
  icon: string;

  @Prop()
  color?: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;
}
export const CoreValueSchema = SchemaFactory.createForClass(CoreValue);


/* ---------------------- MAIN ABOUT PAGE ---------------------- */

@Schema({
  collection: 'about_page',
  timestamps: true,
})
export class About {
  @Prop({ type: HeroSectionSchema, required: true })
  hero: HeroSection;

  @Prop({ type: [StatementSchema], default: [] })
  statements: Statement[];

  @Prop({ type: [ProductStoryItemSchema], default: [] })
  productStory: ProductStoryItem[];

  @Prop({ type: [TeamMemberSchema], default: [] })
  team: TeamMember[];

  @Prop({ type: [CoreValueSchema], default: [] })
  coreValues: CoreValue[];
}

export const AboutSchema = SchemaFactory.createForClass(About);

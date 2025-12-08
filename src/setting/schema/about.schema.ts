// about.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AboutDocument = About & Document;

/* ---------- Subdocuments ---------- */

@Schema({ _id: false })
export class Stat {
  @Prop({ required: true, trim: true })
  number: string;          // e.g. "10+", "50K+"

  @Prop({ required: true, trim: true })
  label: string;           // e.g. "Years Experience"
}
export const StatSchema = SchemaFactory.createForClass(Stat);

@Schema({ _id: false })
export class HeroSection {
  @Prop({ required: true, trim: true })
  mainTitle: string;       // "About Fashion Store"

  @Prop({ trim: true })
  subtitle?: string;

  @Prop({ trim: true })
  buttonText?: string;     // "Our Story"

  @Prop({ trim: true })
  buttonLink?: string;     // "/about"

  @Prop({ type: [StatSchema], default: [] })
  stats: Stat[];
}
export const HeroSectionSchema = SchemaFactory.createForClass(HeroSection);

@Schema({ _id: false })
export class Statement {
  @Prop({ required: true, trim: true })
  icon: string;            // e.g. "i-lucide-target"

  @Prop({ trim: true })
  iconBackgroundColor?: string; // "Blue", "Purple"

  @Prop({ required: true, trim: true })
  title: string;           // "Our Mission", "Our Vision"

  @Prop({ required: true, trim: true })
  description: string;
}
export const StatementSchema = SchemaFactory.createForClass(Statement);

@Schema({ _id: false })
export class ProductStoryItem {
  @Prop({ required: true })
  year: number;            // 2025

  @Prop({ required: true, trim: true })
  milestoneTitle: string;  // "Launched First Product"

  @Prop({ trim: true })
  description?: string;    // Story behind the milestone
}
export const ProductStoryItemSchema =
  SchemaFactory.createForClass(ProductStoryItem);

@Schema({ _id: false })
export class TeamMember {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  titleRole: string;       // "Founder & CEO"

  @Prop({ trim: true })
  shortBio?: string;

  @Prop({ trim: true })
  imageUrl?: string;       // store uploaded image URL
}
export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);

@Schema({ _id: false })
export class CoreValue {
  @Prop({ required: true, trim: true })
  icon: string;            // "i-heroicons-heart"

  @Prop({ trim: true })
  colorGradient?: string;  // "Pink"

  @Prop({ required: true, trim: true })
  title: string;           // "Customer First"

  @Prop({ required: true, trim: true })
  description: string;
}
export const CoreValueSchema = SchemaFactory.createForClass(CoreValue);

/* ---------- Root About Page Schema ---------- */

@Schema({
  collection: 'about_pages',
  timestamps: true,
})
export class About {
  // If you ever want multiple About pages (e.g. per brand) add a slug here
  @Prop({ trim: true, default: 'default', index: true, unique: true })
  slug: string;

  @Prop({ type: HeroSectionSchema, required: true })
  hero: HeroSection;

  // Statement 1 & 2 – stored generically as an array
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

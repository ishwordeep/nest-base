import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type SettingDocument = Setting & Document

@Schema({ timestamps: true })
export class Setting {
    @Prop({ trim: true })
    name?: string

    @Prop({
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    })
    email?: string;

    @Prop({ trim: true })
    phone?: string;

    @Prop({ trim: true })
    address?: string;

    @Prop({ trim: true })
    city?: string;

    @Prop({ trim: true })
    state?: string;

    @Prop({ trim: true })
    country?: string;

    @Prop({ trim: true })
    postalCode?: string;

    @Prop({ trim: true })
    logoUrl?: string;

    @Prop({ trim: true })
    faviconUrl?: string;

    @Prop({ trim: true })
    facebook?: string;

    @Prop({ trim: true })
    instagram?: string;

    @Prop({ trim: true })
    tiktok?: string;

    @Prop({ trim: true })
    description?: string;

    @Prop({ trim: true })
    termsOfServices?: string;

    @Prop({ trim: true })
    cookiesPolicies?: string;

    @Prop({ trim: true })
    returnAndExchanges?: string;

    @Prop({ trim: true })
    sizeGuides?: string;

    @Prop({ trim: true })
    shippingInformations?: string;

}

export const SettingSchema = SchemaFactory.createForClass(Setting);

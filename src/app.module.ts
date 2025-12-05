import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { CompanyModule } from './company/company.module';
import { SettingModule } from './setting/setting.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { UploadModule } from './upload/upload.module';
import { SliderModule } from './slider/slider.module';
import { FrontendModule } from './frontend/frontend.module';
import { HomepageSectionModule } from './homepage-section/homepage-section.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { StripeModule } from './stripe/stripe.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRoot(process.env.DATABASE_URL || 'mongodb://localhost:27017/nest-base'),
    DatabaseModule,
    AuthModule,
    JwtModule,
    UserModule,
    CompanyModule,
    SettingModule,
    CategoryModule,
    ProductModule,
    UploadModule,
    SliderModule,
    FrontendModule,
    HomepageSectionModule,
    CartModule,
    OrderModule,
    StripeModule.forRootAsync(),
    ContactModule
    // StripeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

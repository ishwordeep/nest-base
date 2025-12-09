import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { UserModule } from '../user/user.module';
import { OrderModule } from '../order/order.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    UserModule,
    OrderModule,
    ProductModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class AdminModule {}
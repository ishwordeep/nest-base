import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { OrderModule } from 'src/order/order.module';
import { StripeModule } from '../stripe.module';

@Module({
  imports: [
    OrderModule,
    StripeModule.forRootAsync(),
  ],
  controllers: [WebhookController],
})
export class WebhookModule { }

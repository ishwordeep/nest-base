import { BadRequestException, Controller, Headers, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { StripeService } from '../stripe.service';
import { OrderService } from 'src/order/order.service';
import { Logger } from '@nestjs/common';

@Controller('stripe')
export class WebhookController {
    constructor(
        private readonly stripeService: StripeService,
        private readonly orderService: OrderService,
    ) { }

    @Post('webhook')
    async handleStripeWebhook(
        @Req() req: Request,
        @Headers('stripe-signature') signature: string,
    ) {
        let event;

        try {
            const logger = new Logger(StripeService.name);
            event = await this.stripeService.verifyWebhook(req, signature);
            logger.log(`Webhook: ${event.id} type=${event.type}`);
        } catch (err: any) {
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as any;
                const orderId = paymentIntent.metadata?.orderId;

                if (!orderId) break;

                await this.orderService.markOrderAsPaid(orderId, paymentIntent.id);
                await this.orderService.clearPaymentIntent(orderId);
                break;
            }


            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as any;
                const orderId = paymentIntent.metadata?.orderId;

                if (!orderId) break;

                await this.orderService.markOrderAsFailed(orderId);
                await this.orderService.clearPaymentIntent(orderId);
                break;
            }

        }

        return { received: true };
    }
}

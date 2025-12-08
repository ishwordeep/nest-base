import { Controller, Post, Req, Res, Headers } from '@nestjs/common';
import type { Request, Response } from 'express';
import { StripeService } from '../stripe.service';

@Controller('stripe')
export class WebhookController {
    constructor(private readonly stripeService: StripeService) { }

    @Post('webhook')
    async handleStripeWebhook(
        @Req() req: Request,
        @Res() res: Response,
        @Headers('stripe-signature') signature: string,
    ) {
        return this.stripeService.handleWebhook(req, res, signature);
    }
}

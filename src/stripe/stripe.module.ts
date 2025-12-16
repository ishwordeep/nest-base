import { DynamicModule, Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({})
export class StripeModule {
  static forRootAsync(): DynamicModule {
    return {
      module: StripeModule,
      imports: [ConfigModule.forRoot()],
      controllers: [StripeController],
      providers: [
        StripeService,
        {
          provide: 'STRIPE_API_KEY',
          useFactory: async (configService: ConfigService) =>
            configService.get<string>('STRIPE_API_KEY'),
          inject: [ConfigService],
        },
      ],
      exports: [StripeService],
    };
  }
}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // Ensure ConfigModule is available here (global or explicitly imported)
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('DATABASE_URL'); // or 'database.url' if you prefer that

        if (!uri) {
          throw new Error('DATABASE_URL is not set – cannot connect to MongoDB');
        }

        console.log(
          'Connecting to MongoDB at',
          uri.replace(/\/\/(.*)@/, '//***:***@'), // hide user/pass
        );

        return {
          uri,
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}


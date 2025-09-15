import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, HttpStatus, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map(err => {
          return {
            [err.property]: Object.values(err.constraints ?? {}),
          };
        });

        return new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Bad Request',
          errors: formattedErrors,
        });
      },
    }),
  );
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { MongoError } from 'mongodb';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    // Handle NestJS HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || res;
    }

    // Handle Mongoose validation errors
    else if ((exception as any).name === 'ValidationError') {
      status = HttpStatus.BAD_REQUEST;
      const errors = Object.values((exception as any).errors).map((e: any) => e.message);
      message = { validationErrors: errors };
    }

    // Handle Mongo duplicate key error
    else if (exception instanceof MongoError && (exception as any).code === 11000) {
      status = HttpStatus.CONFLICT; // 409 instead of 400
      message = `Duplicate value error: ${JSON.stringify((exception as any).keyValue)}`;
    }

    // Handle Mongo network error
    else if ((exception as any).name === 'MongoNetworkError') {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database connection error';
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

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

    // HTTP Exception
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    }
    // Mongoose Validation Error
    else if ((exception as any).name === 'ValidationError') {
      status = HttpStatus.BAD_REQUEST;
      const errors = Object.values((exception as any).errors).map(e => e.message);
      message = { validationErrors: errors };
    }
    // Mongo Duplicate Key Error
    else if ((exception as any).code === 11000) {
      status = HttpStatus.BAD_REQUEST;
      message = `Duplicate value error: ${JSON.stringify((exception as any).keyValue)}`;
    }
    // Mongo Connection Error
    else if ((exception as any).name === 'MongoNetworkError') {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database connection error';
    }

    response.status(status).json({
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

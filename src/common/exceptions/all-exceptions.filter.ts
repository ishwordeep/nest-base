import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errors: Record<string, string[]> = { server: ['Internal server error'] };

    // 1️⃣ NestJS HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && (res as any).errors) {
        errors = (res as any).errors; // Already in object format
      } else {
        errors = { error: [typeof res === 'string' ? res : (res as any).message] };
      }
    }
    // 2️⃣ MongoDB duplicate key error
    else if ((exception as any).code === 11000) {
      status = HttpStatus.CONFLICT;
      errors = {
        duplicate: [`Duplicate value: ${JSON.stringify((exception as any).keyValue)}`],
      };
    }

    response.status(status).json({
      success: false,
      // statusCode: status,
      // timestamp: new Date().toISOString(),
      // path: request.url,
      errors, // ✅ Now it's a single object
    });
  }
}

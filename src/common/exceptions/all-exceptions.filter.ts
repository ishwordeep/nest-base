import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

// @Catch()
// export class AllExceptionsFilter implements ExceptionFilter {
//   catch(exception: unknown, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse();
//     const request = ctx.getRequest();

//     let status = HttpStatus.INTERNAL_SERVER_ERROR;
//     let errors: Record<string, string[]> = { server: ['Internal server error'] };
//     let message: string | undefined;

//     // 1️⃣ Handle NestJS HttpException
//     if (exception instanceof HttpException) {
//       status = exception.getStatus();
//       const res = exception.getResponse();

//       if (typeof res === 'object') {
//         message = (res as any).message || undefined;
//         errors = (res as any).errors || { error: [message || 'Unexpected error'] };
//       } else {
//         errors = { error: [res as string] };
//       }
//     }
//     // 2️⃣ Handle MongoDB duplicate key error
//     else if ((exception as any).code === 11000) {
//       status = HttpStatus.CONFLICT;
//       const keyValue = (exception as any).keyValue;
//       message = 'Duplicate key error';
//       errors = Object.keys(keyValue).reduce((acc, key) => {
//         acc[key] = [`${key} already exists`];
//         return acc;
//       }, {} as Record<string, string[]>);
//     }
//     // 3️⃣ Fallback for unknown errors
//     else {
//       message = 'An unexpected error occurred';
//     }

//     // 4️⃣ Build response
//     response.status(status).json({
//       success: false,
//       message,
//       errors,
//       // timestamp: new Date().toISOString(),
//       // path: request.url,
//     });
//   }
// }
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = 500;
    let message = 'An unexpected error occurred';
    let errors: Record<string, string[]> | undefined; // optional

    // Handle NestJS HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object') {
        message = (res as any).message || message;
        // Only use errors if provided in exception
        if ((res as any).errors) {
          errors = (res as any).errors;
        }
      } else if (typeof res === 'string') {
        message = res;
      }
    }
    // Handle MongoDB duplicate key error
    else if ((exception as any).code === 11000) {
      status = 409;
      const keyValue = (exception as any).keyValue;
      message = 'Duplicate key error';
      errors = Object.keys(keyValue).reduce((acc, key) => {
        acc[key] = [`${key} already exists`];
        return acc;
      }, {} as Record<string, string[]>);
    }

    // Build response
    const responseBody: any = { success: false, message };
    if (errors) responseBody.errors = errors; // only add if present

    response.status(status).json(responseBody);
  }
}

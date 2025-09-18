import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If the response is already formatted with success, data, message, return it as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Extract message if it exists in the response
        let message = 'Operation successful';
        if (data && typeof data === 'object' && 'message' in data) {
          message = data.message;
          // Remove message from data to avoid duplication
          const { message: _, ...restData } = data;
          data = restData;
        }

        // Format the response
        return {
          success: true,
          data: data,
          message: message,
        };
      }),
    );
  }
}
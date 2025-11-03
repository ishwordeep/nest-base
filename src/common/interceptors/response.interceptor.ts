// import {
//   Injectable,
//   NestInterceptor,
//   ExecutionContext,
//   CallHandler,
// } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';

// @Injectable()
// export class ResponseInterceptor implements NestInterceptor {
//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     return next.handle().pipe(
//       map((data) => {
//         // If the response is already formatted with success, data, message, return it as is
//         if (data && typeof data === 'object' && 'success' in data) {
//           return data;
//         }

//         // Extract message if it exists in the response
//         let message = 'Operation successful';
//         if (data && typeof data === 'object' && 'message' in data) {
//           message = data.message;
//           // Remove message from data to avoid duplication
//           const { message: _, ...restData } = data;
//           data = restData;
//         }

//         // Format the response
//         return {
//           success: true,
//           data: data,
//           message: message,
//         };
//       }),
//     );
//   }
// }

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type PaginatedPayload = {
  data?: any;
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
  message?: string;
  [key: string]: any;
};

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((payload: PaginatedPayload) => {
        // If already formatted, return as-is
        if (payload && typeof payload === 'object' && 'success' in payload) {
          return payload;
        }

        // Message handling
        let message = 'Operation successful';
        if (payload && typeof payload === 'object' && 'message' in payload) {
          message = String(payload.message);
          const { message: _omit, ...rest } = payload;
          payload = rest;
        }

        // If the handler returned a paginated shape with pagination object
        if (
          payload &&
          typeof payload === 'object' &&
          'data' in payload &&
          Array.isArray(payload.data) &&
          'pagination' in payload &&
          typeof payload.pagination === 'object'
        ) {
          const { data, pagination, ...rest } = payload;

          // Return with pagination object
          return {
            success: true,
            data,
            pagination,
            message,
          };
        }

        // If the handler returned a paginated shape like { data: [...], total, page, limit, pages }
        if (
          payload &&
          typeof payload === 'object' &&
          'data' in payload &&
          Array.isArray(payload.data) &&
          (
            'total' in payload ||
            'page' in payload ||
            'limit' in payload ||
            'pages' in payload
          )
        ) {
          const { data, total, page, limit, pages, ...rest } = payload;

          // Keep only the expected top-level fields; drop any leftover wrapper fields
          return {
            success: true,
            data,
            ...(typeof total !== 'undefined' && { total }),
            ...(typeof page !== 'undefined' && { page }),
            ...(typeof limit !== 'undefined' && { limit }),
            ...(typeof pages !== 'undefined' && { pages }),
            message,
          };
        }

        // Fallback: standard wrapping
        return {
          success: true,
          data: payload,
          message,
        };
      }),
    );
  }
}

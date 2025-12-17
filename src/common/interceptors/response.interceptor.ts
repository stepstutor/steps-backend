import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { PaginatedResponse } from '@common/utils/pagination.util';

export interface ApiResponse<T> {
  data: T;
  status: number;
  success: boolean;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        const { paginationMeta, data: responseData } = data ?? {};

        const result: ApiResponse<T> & {
          paginationMeta?: PaginatedResponse<T>['paginationMeta'];
        } = {
          data: responseData ?? data,
          status: response.statusCode,
          success: response.statusCode >= 200 && response.statusCode < 300,
        };

        if (paginationMeta) {
          result.paginationMeta = paginationMeta;
        }

        return result;
      }),
    );
  }
}

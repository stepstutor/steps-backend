import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    const { method, originalUrl } = request;
    const userAgent = request.headers['user-agent'] ?? 'unknown';
    const ip = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const startedAt = Date.now();

    this.logger.log(
      `${method} ${originalUrl} | agent: ${userAgent} | ip: ${ip}`,
    );

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - startedAt;
        this.logger.log(
          `${method} ${originalUrl} | status: ${response.statusCode} | ${elapsed}ms`,
        );
      }),
    );
  }
}

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const now = Date.now();

    this.logger.log(JSON.stringify({
      type: 'request',
      method,
      url,
      body: this.sanitize(body),
      timestamp: new Date().toISOString(),
    }));

    return next.handle().pipe(
      tap((data) => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;

        this.logger.log(JSON.stringify({
          type: 'response',
          method,
          url,
          statusCode: response.statusCode,
          delay: `${delay}ms`,
          timestamp: new Date().toISOString(),
        }));
      })
    );
  }

  private sanitize(data: any): any {
    if (!data) return data;
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });
    
    return sanitized;
  }
}

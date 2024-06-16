import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { catchError, map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        success: context.switchToHttp().getResponse().statusCode < 400,
        ...data,
      })),
      catchError((error) => {
        const { status, message } = error;
        throw new HttpException(
          {
            success: false,
            error: message || 'Internal server error',
          },
          status || 502,
        );
      }),
    );
  }
}

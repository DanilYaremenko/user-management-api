import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { catchError, map, Observable, throwError } from 'rxjs';

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

        if (error instanceof BadRequestException) {
          const response = error.getResponse();
          const errors = Array.isArray(response['message'])
            ? response['message']
            : [response['message']];

          return throwError(
            () =>
              new HttpException(
                {
                  message: errors,
                  error: 'Bad Request',
                  statusCode: 400,
                },
                400,
              ),
          );
        }

        return throwError(
          () =>
            new HttpException(
              {
                success: false,
                error: message || 'Internal server error',
              },
              status || 500,
            ),
        );
      }),
    );
  }
}

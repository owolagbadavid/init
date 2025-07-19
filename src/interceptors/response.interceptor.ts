import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from 'src/models/api-response';
import { RESPONSE_MESSAGE_KEY } from 'src/decorators/response-message.decorator';
import { Response } from 'express';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const res: Response = ctx.getResponse();

    const handler = context.getHandler();
    const message = this.reflector.get<string>(RESPONSE_MESSAGE_KEY, handler);

    const statusCode = res.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((data) => {
        // // If statusCode wasn't explicitly set (e.g., via @HttpCode), set it
        // if (
        //   !res.statusCode ||
        //   (res.statusCode as HttpStatus) === HttpStatus.OK
        // ) {
        //   res.status(statusCode);
        // }

        return new ApiResponse<T>(
          true,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          data,
          message ?? 'Request successful',
          statusCode,
        );
      }),
    );
  }
}

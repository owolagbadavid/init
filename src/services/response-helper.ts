import { Response } from 'express';
import { ApiResponse } from 'src/models/api-response';
import { HttpStatus } from '@nestjs/common';
import * as http from 'http';

export class ResponseHelper {
  static defaultOk(res: Response, message?: string) {
    res.status(HttpStatus.OK);

    return new ApiResponse<string>(
      true,
      undefined,
      message ?? this.statusText(HttpStatus.OK),
      HttpStatus.OK,
    );
  }

  static noContent(res: Response, message?: string) {
    res.status(HttpStatus.NO_CONTENT);

    return new ApiResponse<string>(
      true,
      undefined,
      message ?? this.statusText(HttpStatus.NO_CONTENT),
      HttpStatus.NO_CONTENT,
    );
  }

  static ok<T>(res: Response, data: T, message?: string) {
    res.status(HttpStatus.OK);

    return new ApiResponse<T>(
      true,
      data,
      message ?? this.statusText(HttpStatus.OK),
      HttpStatus.OK,
    );
  }

  static created<T>(
    res: Response,
    location: string,
    data: T,
    message?: string,
  ) {
    res.location(location);
    res.status(HttpStatus.CREATED);

    return new ApiResponse<T>(
      true,
      data,
      message ?? this.statusText(HttpStatus.CREATED),
      HttpStatus.CREATED,
    );
  }

  static error<T>(res: Response, status: number, message?: string) {
    res.status(status);

    return new ApiResponse<T>(
      false,
      undefined,
      message ?? 'Error occurred',
      status,
    );
  }

  static get statusText(): (status: HttpStatus) => string {
    return (status: HttpStatus) =>
      http.STATUS_CODES[status] || 'Unknown Status';
  }
}

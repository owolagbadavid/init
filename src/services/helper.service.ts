import { QueryFailedError } from 'typeorm';
import { DatabaseError } from 'pg-protocol';
import { Transform } from 'class-transformer';

export class HelperService {
  static isQueryFailedError = (
    err: unknown,
  ): err is QueryFailedError & DatabaseError => err instanceof QueryFailedError;

  static Normalize() {
    return Transform(({ value }) =>
      typeof value === 'string' ? value.trim().toUpperCase() : '',
    );
  }

  static Trim() {
    return Transform(({ value }) =>
      typeof value === 'string' ? value.trim() : '',
    );
  }
}

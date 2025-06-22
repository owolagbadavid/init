import { QueryFailedError } from 'typeorm';
import { DatabaseError } from 'pg-protocol';
import { Transform } from 'class-transformer';
import { ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { PgErrorCode } from 'src/types/pg.err.type';

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

  static handleDbError(err: unknown, message: string): Error | undefined {
    if (HelperService.isQueryFailedError(err)) {
      const { detail, table, constraint } = err;
      const columnMatch = detail?.match(/Key \((.*?)\)=/);
      const columnName = columnMatch ? columnMatch[1] : constraint;

      switch (err.code) {
        case PgErrorCode.PG_UNIQUE_VIOLATION:
          return new ConflictException(
            `Duplicate entry in table '${table}' for column '${columnName}'`,
          );
        default:
          return new ServiceUnavailableException(message);
      }
    }
  }
}

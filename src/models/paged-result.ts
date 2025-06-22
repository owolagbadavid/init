import { ApiProperty } from '@nestjs/swagger';

export class PagedResult<T> {
  constructor(
    items: T[],
    totalCount: number,
    pageNo: number,
    pageSize: number,
  ) {
    this.Items = items;
    this.TotalCount = totalCount;
    this.PageNo = pageNo;
    this.PageSize = pageSize;
  }

  @ApiProperty()
  Items: T[];

  @ApiProperty()
  TotalCount: number;

  @ApiProperty()
  PageNo: number;

  @ApiProperty()
  PageSize: number;
}

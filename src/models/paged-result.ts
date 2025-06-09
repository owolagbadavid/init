export class PagedResult<T> {
  Items: T[];
  TotalCount: number;
  PageNo: number;
  PageSize: number;
}

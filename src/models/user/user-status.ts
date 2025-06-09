import { StatusEnum } from '../enums';

export type UserStatus =
  | StatusEnum.ACTIVE
  | StatusEnum.DISABLED
  | StatusEnum.PENDING;

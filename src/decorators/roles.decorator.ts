import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from 'src/models/enums';

export const Roles = (roles: RoleEnum[]) => SetMetadata('roles', roles);

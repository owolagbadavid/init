import { ApiProperty } from '@nestjs/swagger';

export class Avatar {
  @ApiProperty()
  style: string;

  @ApiProperty()
  seed: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  color: string;
}

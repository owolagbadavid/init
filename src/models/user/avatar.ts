import { ApiProperty } from '@nestjs/swagger';

export class Avatar {
  @ApiProperty()
  Style: string;

  @ApiProperty()
  Seed: string;

  @ApiProperty()
  Url: string;

  @ApiProperty()
  Color: string;
}

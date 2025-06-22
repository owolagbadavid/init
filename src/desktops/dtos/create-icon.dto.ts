import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateIconDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsNumber()
  xPosition: number;

  @ApiProperty()
  @IsNumber()
  yPosition: number;

  @ApiProperty()
  @IsBoolean()
  isCustomApp: boolean = false;
}

export class UpdateIconDto extends PartialType(CreateIconDto) {}

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class WidgetDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  xPosition: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  yPosition: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  typeId: string;
}

export class UpdateWidgetDto extends PartialType(WidgetDto) {}

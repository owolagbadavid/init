import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class WidgetTypeDto {
  @ApiPropertyOptional()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsString()
  code: string;
}

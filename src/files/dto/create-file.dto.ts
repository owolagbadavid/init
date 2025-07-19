import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFileDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fileType: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  language?: string;
}

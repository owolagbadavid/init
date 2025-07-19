import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { UserContext } from 'src/decorators';
import { AuthGuard } from 'src/auth/guards';
import { ApiBadRequestResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from 'src/models/api-response';
import { ResponseInterceptor } from 'src/interceptors/response.interceptor';
import { ResponseMessage } from 'src/decorators/response-message.decorator';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: ApiResponse })
@ApiTags('Files')
@UseGuards(AuthGuard)
@UseInterceptors(ResponseInterceptor)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  create(
    @Body() createFileDto: CreateFileDto,
    @UserContext('sub') userId: string,
  ) {
    return this.filesService.create(createFileDto, userId);
  }

  @Get()
  findAll(@UserContext('sub') userId: string) {
    return this.filesService.findAll(userId);
  }

  @ResponseMessage('File retrieved successfully')
  @Get(':id')
  findOne(@Param('id') id: string, @UserContext('sub') userId: string) {
    return this.filesService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
    @UserContext('sub') userId: string,
  ) {
    return this.filesService.update(id, updateFileDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserContext('sub') userId: string) {
    return this.filesService.remove(id, userId);
  }
}

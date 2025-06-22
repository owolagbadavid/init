import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DesktopsService } from './desktops.service';
import { WidgetTypeDto } from './dtos/widget-type.dto';
import { ResponseHelper } from 'src/services/response-helper';
import { Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponse } from 'src/models/api-response';
import { PagedResult } from 'src/models/paged-result';
import { UserContext } from 'src/decorators';
import { AuthGuard } from 'src/auth/guards';
import { UpdateWidgetDto, WidgetDto } from './dtos/widget.dto';
import { CreateIconDto, UpdateIconDto } from './dtos/create-icon.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: ApiResponse })
@UseGuards(AuthGuard)
@ApiTags('Desktops')
@Controller('desktops')
export class DesktopsController {
  constructor(private readonly desktopsService: DesktopsService) {}

  @ApiOkResponse({ type: ApiResponse<PagedResult<WidgetTypeDto>> })
  @Get('widget/types')
  async getWidgetTypes(@Res({ passthrough: true }) res: Response) {
    const widgetTypes = await this.desktopsService.getWidgetTypes();
    return ResponseHelper.ok(
      res,
      widgetTypes,
      'Widget types retrieved successfully',
    );
  }

  @ApiOkResponse({ type: ApiResponse<WidgetTypeDto> })
  @Get('widget/types/:id')
  async getWidgetTypeById(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const widgetType = await this.desktopsService.getWidgetTypeById(id);

    return ResponseHelper.ok(
      res,
      widgetType,
      'Widget type retrieved successfully',
    );
  }

  @ApiOkResponse({ type: ApiResponse<WidgetTypeDto> })
  @Get('widget/types/by-code/:code')
  async getWidgetTypeByCode(
    @Param('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const widgetType = await this.desktopsService.getWidgetTypeByCode(code);

    return ResponseHelper.ok(
      res,
      widgetType,
      'Widget type retrieved successfully',
    );
  }

  @ApiCreatedResponse({ type: ApiResponse<WidgetTypeDto> })
  @Post('widget/types')
  async createWidgetType(
    @Body() widgetTypeDto: WidgetTypeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const createdWidgetType =
      await this.desktopsService.createWidgetType(widgetTypeDto);

    return ResponseHelper.created(
      res,
      `/desktops/widget/types/${createdWidgetType.id}`,
      createdWidgetType,
      'Widget type created successfully',
    );
  }

  @ApiNoContentResponse({ type: ApiResponse<WidgetTypeDto> })
  @Delete('widget/types/:id')
  async deleteWidgetType(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.desktopsService.deleteWidgetType(id);
    return ResponseHelper.noContent(res, 'Widget type deleted successfully');
  }

  @ApiCreatedResponse({ type: ApiResponse })
  @Post()
  async createDesktop(
    @Body() createDesktopDto: any, // Replace with actual DTO
    @Res({ passthrough: true }) res: Response,
    @UserContext('sub') userId: string,
  ) {
    const desktopId = await this.desktopsService.createDesktop(userId);

    return ResponseHelper.created(
      res,
      `/desktops/${desktopId}`,
      { id: desktopId },
      'Desktop created successfully',
    );
  }

  @Get()
  @ApiOkResponse({ type: ApiResponse })
  async getUserDesktop(
    @UserContext('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const desktop = await this.desktopsService.getUserDesktop(userId);
    return ResponseHelper.ok(
      res,
      desktop,
      'User desktop retrieved successfully',
    );
  }

  @Post(':desktopId/widgets')
  async createWidget(
    @Param('desktopId') desktopId: string,
    @Body() createWidgetDto: WidgetDto,
    @UserContext('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const widgetId = await this.desktopsService.createWidget(
      desktopId,
      userId,
      createWidgetDto,
    );

    return ResponseHelper.created(
      res,
      `/desktops/${desktopId}/widgets/${widgetId}`,
      { id: widgetId },
      'Widget created successfully',
    );
  }

  @Patch(':desktopId/widgets/:widgetId')
  async updateWidget(
    @Param('desktopId') desktopId: string,
    @Param('widgetId') widgetId: string,
    @Body() updateWidgetDto: UpdateWidgetDto,
    @UserContext('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.desktopsService.updateWidget(
      desktopId,
      widgetId,
      userId,
      updateWidgetDto,
    );

    return ResponseHelper.defaultOk(res, 'Widget updated successfully');
  }

  @Post(':desktopId/icons')
  async createIcon(
    @Param('desktopId') desktopId: string,
    @Body() createIconDto: CreateIconDto,
    @UserContext('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const iconId = await this.desktopsService.createIcon(
      desktopId,
      userId,
      createIconDto,
    );

    return ResponseHelper.created(
      res,
      `/desktops/${desktopId}/icons/${iconId}`,
      { id: iconId },
      'Icon created successfully',
    );
  }

  @Patch(':desktopId/icons/:iconId')
  async updateIcon(
    @Param('desktopId') desktopId: string,
    @Param('iconId') iconId: string,
    @Body() updateIconDto: UpdateIconDto,
    @UserContext('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.desktopsService.updateIcon(
      desktopId,
      iconId,
      userId,
      updateIconDto,
    );

    return ResponseHelper.defaultOk(res, 'Icon updated successfully');
  }

  @Delete(':desktopId/widgets/:widgetId')
  async deleteWidget(
    @Param('desktopId') desktopId: string,
    @Param('widgetId') widgetId: string,
    @UserContext('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.desktopsService.deleteWidget(desktopId, widgetId, userId);
    return ResponseHelper.noContent(res, 'Widget deleted successfully');
  }

  @Delete(':desktopId/icons/:iconId')
  async deleteIcon(
    @Param('desktopId') desktopId: string,
    @Param('iconId') iconId: string,
    @UserContext('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.desktopsService.deleteIcon(desktopId, iconId, userId);
    return ResponseHelper.noContent(res, 'Icon deleted successfully');
  }

  @Get(':desktopId/icons')
  async getDesktopIcons(
    @Param('desktopId') desktopId: string,
    @UserContext('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const icons = await this.desktopsService.getDesktopIcons(desktopId, userId);
    return ResponseHelper.ok(
      res,
      icons,
      'Desktop icons retrieved successfully',
    );
  }

  @Get(':desktopId/icons/:iconId')
  async getDesktopIcon(
    @Param('desktopId') desktopId: string,
    @Param('iconId') iconId: string,
    @UserContext('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const icon = await this.desktopsService.getDesktopIcon(
      desktopId,
      iconId,
      userId,
    );
    return ResponseHelper.ok(res, icon, 'Desktop icon retrieved successfully');
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post(':desktopId/customBackground')
  @UseInterceptors(FileInterceptor('file'))
  async setCustomBackground(
    @Param('desktopId') desktopId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
      }),
    )
    image: Express.Multer.File,
    @UserContext('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.desktopsService.uploadCustomBackground(desktopId, userId, image);

    return ResponseHelper.defaultOk(res, 'Custom background set successfully');
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post(':desktopId/icons/:iconId/image')
  @UseInterceptors(FileInterceptor('file'))
  async setIconImage(
    @Param('desktopId') desktopId: string,
    @Param('iconId') iconId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
      }),
    )
    image: Express.Multer.File,
    @UserContext('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.desktopsService.uploadIconImage(
      desktopId,
      iconId,
      userId,
      image,
    );

    return ResponseHelper.defaultOk(res, 'Icon image uploaded successfully');
  }
}

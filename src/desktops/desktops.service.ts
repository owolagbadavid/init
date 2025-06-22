import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  Desktop,
  DesktopFile,
  DesktopIcon,
  DesktopIconFile,
  FileRecord,
  User,
  Widget,
  WidgetType,
} from 'src/db/entities';
import { PagedResult } from 'src/models/paged-result';
import { CloudStorageService } from 'src/services/cloud-storage.service';
import { HelperService } from 'src/services/helper.service';
import { DataSource, Repository } from 'typeorm';
import { WidgetDto } from './dtos/widget.dto';
import { CreateIconDto } from './dtos/create-icon.dto';
import { randomUUID } from 'crypto';
import { DesktopFileEnum, DesktopIconFileEnum } from 'src/models/enums';

@Injectable()
export class DesktopsService {
  constructor(
    private readonly cloudStorageService: CloudStorageService,
    @InjectRepository(WidgetType)
    private readonly widgetTypeRepo: Repository<WidgetType>,
    @InjectRepository(Widget)
    private readonly widgetRepo: Repository<Widget>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Desktop)
    private readonly desktopRepo: Repository<Desktop>,
    @InjectRepository(DesktopIcon)
    private readonly desktopIconRepo: Repository<DesktopIcon>,
    @InjectRepository(FileRecord)
    private readonly fileRecordRepo: Repository<FileRecord>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(DesktopFile)
    private readonly desktopFileRepo: Repository<DesktopFile>,
    @InjectRepository(DesktopIconFile)
    private readonly desktopIconFileRepo: Repository<DesktopIconFile>,
  ) {}

  async getWidgetTypes(): Promise<PagedResult<WidgetType>> {
    const widgetTypes = (await this.widgetTypeRepo.find()) ?? [];

    return new PagedResult<WidgetType>(
      widgetTypes,
      widgetTypes.length,
      1,
      widgetTypes.length,
    );
  }

  async createWidgetType(data: Partial<WidgetType>): Promise<WidgetType> {
    try {
      delete data.id; // Ensure no ID is provided for creation
      const widgetType = this.widgetTypeRepo.create(data);
      await this.widgetTypeRepo.save(widgetType);
      return widgetType;
    } catch (e) {
      const err = HelperService.handleDbError(e, 'Error creating widget type');
      if (err) {
        throw err;
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the widget type',
      );
    }
  }

  async deleteWidgetType(id: string): Promise<void> {
    const inUse = await this.widgetRepo.exists({
      where: { typeId: id },
    });

    if (inUse) {
      throw new BadRequestException(
        'Widget type is in use and cannot be deleted',
      );
    }

    await this.widgetTypeRepo.delete(id);
  }

  async getWidgetTypeById(id: string): Promise<WidgetType> {
    const widgetType = await this.widgetTypeRepo.findOneBy({ id });
    if (!widgetType) {
      throw new BadRequestException('Widget type not found');
    }
    return widgetType;
  }

  async getWidgetTypeByCode(code: string): Promise<WidgetType> {
    const widgetType = await this.widgetTypeRepo.findOneBy({ code });
    if (!widgetType) {
      throw new BadRequestException('Widget type not found');
    }
    return widgetType;
  }

  async createDesktop(userId: string): Promise<string> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: {
        desktop: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.desktop) {
      throw new BadRequestException('User already has a desktop');
    }
    try {
      const desktop = this.desktopRepo.create({
        userId: user.id,
      });

      await this.desktopRepo.save(desktop);
      return desktop.id;
    } catch (e) {
      const err = HelperService.handleDbError(e, 'Error creating desktop');
      if (err) {
        throw err;
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the desktop',
      );
    }
  }

  async getUserDesktop(userId: string): Promise<Desktop> {
    const desktop = await this.desktopRepo.findOne({
      where: { userId },
      relations: {
        widgets: {
          type: true,
        },
        icons: true,
      },
    });

    if (!desktop) {
      throw new BadRequestException('User desktop not found');
    }

    return desktop;
  }

  async createWidget(
    desktopId: string,
    userId: string,
    data: WidgetDto,
  ): Promise<string> {
    const desktop = await this.desktopRepo.findOne({
      where: { id: desktopId, userId },
    });

    if (!desktop) {
      throw new BadRequestException('Desktop not found');
    }

    const widgetType = await this.widgetTypeRepo.findOne({
      where: { id: data.typeId },
    });
    if (!widgetType) {
      throw new BadRequestException('Widget type not found');
    }

    try {
      const widget = this.widgetRepo.create({
        ...data,
        desktopId: desktop.id,
      });

      await this.widgetRepo.save(widget);
      return widget.id;
    } catch (e) {
      const err = HelperService.handleDbError(e, 'Error creating widget');
      if (err) {
        throw err;
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the widget',
      );
    }
  }

  async updateWidget(
    desktopId: string,
    widgetId: string,
    userId: string,
    data: Partial<WidgetDto>,
  ): Promise<void> {
    const desktop = await this.desktopRepo.findOne({
      where: { id: desktopId, userId },
    });

    if (!desktop) {
      throw new BadRequestException('Desktop not found');
    }

    const widget = await this.widgetRepo.findOne({
      where: { id: widgetId, desktopId: desktop.id },
    });

    if (!widget) {
      throw new BadRequestException('Widget not found');
    }

    try {
      Object.assign(widget, data);
      await this.widgetRepo.save(widget);
    } catch (e) {
      const err = HelperService.handleDbError(e, 'Error updating widget');
      if (err) {
        throw err;
      }
      throw new InternalServerErrorException(
        'An error occurred while updating the widget',
      );
    }
  }

  async createIcon(
    desktopId: string,
    userId: string,
    data: CreateIconDto,
  ): Promise<string> {
    const desktop = await this.desktopRepo.findOne({
      where: { id: desktopId, userId },
    });

    if (!desktop) {
      throw new BadRequestException('Desktop not found');
    }

    try {
      const icon = this.desktopIconRepo.create({
        ...data,
        desktopId: desktop.id,
      });

      await this.desktopIconRepo.save(icon);
      return icon.id;
    } catch (e) {
      const err = HelperService.handleDbError(e, 'Error creating icon');
      if (err) {
        throw err;
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the icon',
      );
    }
  }

  async updateIcon(
    desktopId: string,
    iconId: string,
    userId: string,
    data: Partial<CreateIconDto>,
  ): Promise<void> {
    const desktop = await this.desktopRepo.findOne({
      where: { id: desktopId, userId },
    });

    if (!desktop) {
      throw new BadRequestException('Desktop not found');
    }

    const icon = await this.desktopIconRepo.findOne({
      where: { id: iconId, desktopId: desktop.id },
    });

    if (!icon) {
      throw new BadRequestException('Icon not found');
    }

    try {
      Object.assign(icon, data);
      await this.desktopIconRepo.save(icon);
    } catch (e) {
      const err = HelperService.handleDbError(e, 'Error updating icon');
      if (err) {
        throw err;
      }
      throw new InternalServerErrorException(
        'An error occurred while updating the icon',
      );
    }
  }

  async deleteIcon(
    desktopId: string,
    iconId: string,
    userId: string,
  ): Promise<void> {
    const desktop = await this.desktopRepo.findOne({
      where: { id: desktopId, userId },
    });

    if (!desktop) {
      throw new BadRequestException('Desktop not found');
    }

    const icon = await this.desktopIconRepo.findOne({
      where: { id: iconId, desktopId: desktop.id },
    });

    if (!icon) {
      throw new BadRequestException('Icon not found');
    }

    try {
      await this.desktopIconRepo.remove(icon);
    } catch (e) {
      const err = HelperService.handleDbError(e, 'Error deleting icon');
      if (err) {
        throw err;
      }
      throw new InternalServerErrorException(
        'An error occurred while deleting the icon',
      );
    }
  }

  async deleteWidget(
    desktopId: string,
    widgetId: string,
    userId: string,
  ): Promise<void> {
    const desktop = await this.desktopRepo.findOne({
      where: { id: desktopId, userId },
    });

    if (!desktop) {
      throw new BadRequestException('Desktop not found');
    }

    const widget = await this.widgetRepo.findOne({
      where: { id: widgetId, desktopId: desktop.id },
    });

    if (!widget) {
      throw new BadRequestException('Widget not found');
    }

    try {
      await this.widgetRepo.remove(widget);
    } catch (e) {
      const err = HelperService.handleDbError(e, 'Error deleting widget');
      if (err) {
        throw err;
      }
      throw new InternalServerErrorException(
        'An error occurred while deleting the widget',
      );
    }
  }

  async uploadCustomBackground(
    desktopId: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const desktop = await this.desktopRepo.findOne({
      where: { id: desktopId, userId },
    });

    if (!desktop) {
      throw new BadRequestException('Desktop not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const uuid = randomUUID();
    const fileExtension = file.mimetype.split('/')[1];

    const existingFile = await this.desktopFileRepo.findOne({
      where: {
        desktopId: desktop.id,
        desktopFileType: DesktopFileEnum.CUSTOMBACKGROUND,
      },
      relations: {
        fileRecord: true,
      },
    });

    if (existingFile) {
      await queryRunner.manager.remove(existingFile);
      await queryRunner.manager.softRemove(existingFile.fileRecord);
    }

    try {
      const fileRecord = this.fileRecordRepo.create({
        id: uuid,
        fileUrl: '',
        mimeType: file.mimetype,
        fileName: file.originalname,
        fileSize: file.size,
      });

      const fileUrl = await this.cloudStorageService.uploadBlob(
        `desktops/${desktopId}/backgrounds/${uuid}.${fileExtension}`,
        file,
      );

      fileRecord.fileUrl = fileUrl;

      const desktopFile = this.desktopFileRepo.create({
        desktopId: desktop.id,
        fileRecordId: fileRecord.id,
        desktopFileType: DesktopFileEnum.CUSTOMBACKGROUND,
      });

      await queryRunner.manager.save(fileRecord);
      await queryRunner.manager.save(desktopFile);

      await queryRunner.commitTransaction();

      // todo: background job to remove old file
      if (existingFile) this.deleteFile(existingFile.fileRecordId);

      return fileUrl;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.error(e);
      const err = HelperService.handleDbError(e, 'Error uploading background');
      if (err) {
        throw err;
      }
      throw new InternalServerErrorException(
        'An error occurred while uploading the custom background',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async uploadIconImage(
    desktopId: string,
    desktopIconId: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const desktop = await this.desktopRepo.findOne({
      where: { id: desktopId, userId },
    });

    if (!desktop) {
      throw new BadRequestException('Desktop not found');
    }

    const desktopIcon = await this.desktopIconRepo.findOne({
      where: { id: desktopIconId, desktopId: desktop.id },
    });

    if (!desktopIcon) {
      throw new BadRequestException('Desktop icon not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const uuid = randomUUID();
    const fileExtension = file.mimetype.split('/')[1];

    const existingFile = await this.desktopIconFileRepo.findOne({
      where: {
        desktopIconId: desktopIconId,
        desktopIconFileType: DesktopIconFileEnum.IMAGE,
      },
      relations: {
        fileRecord: true,
      },
    });

    if (existingFile) {
      await queryRunner.manager.remove(existingFile);
      await queryRunner.manager.softRemove(existingFile.fileRecord);
    }

    try {
      const fileRecord = this.fileRecordRepo.create({
        id: uuid,
        fileUrl: '',
        mimeType: file.mimetype,
        fileName: file.originalname,
        fileSize: file.size,
      });

      const fileUrl = await this.cloudStorageService.uploadBlob(
        `desktops/${desktopId}/icons/${desktopIconId}/${uuid}.${fileExtension}`,
        file,
      );

      fileRecord.fileUrl = fileUrl;

      const desktopIconFile = this.desktopIconFileRepo.create({
        desktopIconId: desktopIcon.id,
        fileRecordId: fileRecord.id,
        desktopIconFileType: DesktopIconFileEnum.IMAGE,
      });

      await queryRunner.manager.save(fileRecord);
      await queryRunner.manager.save(desktopIconFile);

      await queryRunner.commitTransaction();

      // todo: background job to remove old file
      if (existingFile) this.deleteFile(existingFile.fileRecordId);

      return fileUrl;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.error(e);
      const err = HelperService.handleDbError(e, 'Error uploading background');
      if (err) {
        throw err;
      }
      throw new InternalServerErrorException(
        'An error occurred while uploading the custom background',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getDesktopIcon(
    desktopId: string,
    iconId: string,
    userId: string,
  ): Promise<DesktopIcon> {
    const icon = await this.desktopIconRepo.findOne({
      where: { id: iconId, desktopId, desktop: { userId } },
    });

    if (!icon) {
      throw new BadRequestException('Icon not found');
    }

    return icon;
  }

  async getDesktopIcons(
    desktopId: string,
    userId: string,
  ): Promise<DesktopIcon[]> {
    const icons = await this.desktopIconRepo.find({
      where: { desktopId, desktop: { userId } },
    });

    return icons ?? [];
  }

  private async deleteFile(fileRecordId: string): Promise<void> {
    try {
      const fileRecord = await this.fileRecordRepo.findOne({
        where: { id: fileRecordId },
        withDeleted: true,
      });

      if (!fileRecord) {
        throw new BadRequestException('File record not found');
      }

      await this.cloudStorageService.deleteBlob(fileRecord.fileUrl);

      await this.fileRecordRepo.remove(fileRecord);
    } catch (e) {
      console.error(e);
      const err = HelperService.handleDbError(e, 'Error deleting file');
      if (err) {
        throw err;
      }
      throw new InternalServerErrorException(
        'An error occurred while deleting the file',
      );
    }
  }
}

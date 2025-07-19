import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FileContent, FileEntity } from 'src/db/entities';
import { Repository } from 'typeorm';
import { HelperService } from 'src/services/helper.service';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity) private fileRepo: Repository<FileEntity>,
  ) {}

  create(createFileDto: CreateFileDto, userId: string) {
    const file = new FileEntity();
    file.fileType = createFileDto.fileType;
    file.fileName = createFileDto.fileName;
    file.userId = userId;

    if (createFileDto.content) {
      const content = new FileContent();
      content.content = createFileDto.content;
      content.language = createFileDto.language;
      file.content = content;
    }

    try {
      return this.fileRepo.save(file);
    } catch (e) {
      const err = HelperService.handleDbError(e, 'Error updating file');
      if (err) {
        throw err;
      }
      throw new InternalServerErrorException(
        'An error occurred while updating the file',
      );
    }
  }

  findAll(userId: string) {
    return this.fileRepo.find({ where: { userId } });
  }

  async findOne(id: string, userId: string) {
    const file = await this.fileRepo.findOne({
      where: { id, userId },
      relations: {
        content: true,
      },
    });

    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }
    return file;
  }

  async update(id: string, updateFileDto: UpdateFileDto, userId: string) {
    const file = await this.fileRepo.findOne({
      where: { id, userId },
      relations: {
        content: true,
      },
    });
    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }

    file.fileType = updateFileDto.fileType || file.fileType;
    file.fileName = updateFileDto.fileName || file.fileName;

    if (updateFileDto.content) {
      if (!file.content) {
        file.content = new FileContent();
        file.content.content = updateFileDto.content;
        file.content.language = updateFileDto.language;
      } else {
        file.content.content = updateFileDto.content || file.content.content;
        file.content.language = updateFileDto.language || file.content.language;
      }
    }
    try {
      return this.fileRepo.save(file);
    } catch (e) {
      const err = HelperService.handleDbError(e, 'Error updating file');
      if (err) {
        throw err;
      }
      throw new InternalServerErrorException(
        'An error occurred while updating the file',
      );
    }
  }

  async remove(id: string, userId: string) {
    const file = await this.fileRepo.findOne({ where: { id, userId } });
    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }
    try {
      return this.fileRepo.softRemove(file);
    } catch (e) {
      const err = HelperService.handleDbError(e, 'Error removing file');
      if (err) {
        throw err;
      }
      throw new InternalServerErrorException(
        'An error occurred while removing the file',
      );
    }
  }
}

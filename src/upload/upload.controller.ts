import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadService } from './upload.service';
import type { Express } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // ------------------ SINGLE IMAGE UPLOAD ------------------
  @Post('single')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, callback) => {
          const ext = path.extname(file.originalname);
          callback(null, `${uuidv4()}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
      fileFilter: (_, file, callback) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowedTypes.test(ext)) {
          return callback(
            new BadRequestException(
              'Only images are allowed (jpg, jpeg, png, webp)',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadSingle(@UploadedFile() file?: Express.Multer.File): string {
    if (!file) throw new BadRequestException('No file provided');
    return this.uploadService.getFilePath(file);
  }

  // ------------------ MULTIPLE IMAGES UPLOAD ------------------
  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, callback) => {
          const ext = path.extname(file.originalname);
          callback(null, `${uuidv4()}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB per file
      fileFilter: (_, file, callback) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowedTypes.test(ext)) {
          return callback(
            new BadRequestException(
              'Only images are allowed (jpg, jpeg, png, webp)',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadMultiple(@UploadedFiles() files?: Express.Multer.File[]): string[] {
    if (!files || files.length === 0)
      throw new BadRequestException('No files provided');
    return this.uploadService.getMultipleFilePaths(files);
  }
}

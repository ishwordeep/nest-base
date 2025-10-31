import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import type { Express } from 'express';

@Injectable()
export class UploadService {
  private readonly uploadDir = path.join(__dirname, '../../uploads');
  private readonly baseUrl = process.env.APP_URL || 'http://localhost:3000';

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getFilePath(file: Express.Multer.File): string {
    return `${this.baseUrl}/uploads/${file.filename}`;
  }

  getMultipleFilePaths(files: Express.Multer.File[]): string[] {
    return files.map((file) => `${this.baseUrl}/uploads/${file.filename}`);
  }
}

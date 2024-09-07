import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { DownloadService } from './download.service';
import * as fs from 'fs';

@Controller('download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Get()
  async downloadFile() {
    await this.downloadService.downloadFile();
    return 'File download initiated';
  }

  @Post('write-url')
  async writeUrl(@Body('url') url: string) {
    await this.downloadService.writeUrl(url);
    return 'URL written successfully';
  }

  @Get('list')
  async listFiles() {
    return this.downloadService.listFiles();
  }

  @Get(':filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = this.downloadService.getFilePath(filename);
    
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).send('File not found');
    }
  }
}
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';

@Injectable()
export class DownloadService {
  private readonly logger = new Logger(DownloadService.name);
  private readonly downloadsDir = path.join(__dirname, '..', '..', 'downloads');
  private readonly urlFilePath = path.join(this.downloadsDir, 'url.txt');

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleMidnightDownload() {
    this.logger.debug('Starting midnight download task...');
    await this.downloadFile();
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async handleNoonDownload() {
    this.logger.debug('Starting noon download task...');
    await this.downloadFile();
  }

  async writeUrl(url: string) {
    try {
      await this.ensureDirectoryExists(this.downloadsDir);
      await fs.promises.writeFile(this.urlFilePath, url, 'utf8');
      this.logger.debug(`URL written successfully: ${url}`);
    } catch (error) {
      this.logger.error('Failed to write URL', error);
      throw error;
    }
  }

  async downloadFile() {
    let url: string;
    try {
      await this.ensureDirectoryExists(this.downloadsDir);
      url = await fs.promises.readFile(this.urlFilePath, 'utf8');
    } catch (error) {
      this.logger.error('Failed to read URL from file', error);
      throw error;
    }

    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
      });

      const contentType = response.headers['content-type'];
      const extension = mime.extension(contentType) || 'unknown';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = path.join(this.downloadsDir, `downloaded-file-${timestamp}.${extension}`);

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          this.logger.debug(`File downloaded successfully: ${filePath}`);
          resolve('Download complete');
        });
        writer.on('error', reject);
      });
    } catch (error) {
      this.logger.error('Download failed', error);
      throw error;
    }
  }

  async listFiles() {
    try {
      const files = await fs.promises.readdir(this.downloadsDir);
      return files.filter(file => file !== 'url.txt').map(file => ({
        name: file,
        path: path.join(this.downloadsDir, file)
      }));
    } catch (error) {
      this.logger.error('Failed to list files', error);
      throw error;
    }
  }

  getFilePath(filename: string) {
    return path.join(this.downloadsDir, filename);
  }

  private async ensureDirectoryExists(dirPath: string) {
    try {
      await fs.promises.access(dirPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.promises.mkdir(dirPath, { recursive: true });
      } else {
        throw error;
      }
    }
  }
}
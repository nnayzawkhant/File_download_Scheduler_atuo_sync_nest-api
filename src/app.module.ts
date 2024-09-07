import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DownloadModule } from './download/download.module';

@Module({
  imports: [ScheduleModule.forRoot(), DownloadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // ... existing methods ...
  getHello(): string {
    return 'Hello World!';
  }

  writeData(data: any): string {
    // Implement your data writing logic here
    return 'Data written successfully';
  }
}

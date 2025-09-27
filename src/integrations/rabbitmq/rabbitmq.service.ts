import { Injectable } from '@nestjs/common';

@Injectable()
export class RabbitmqService {
  publishMessage(queue: string, message: any): Promise<void> {
    return Promise.resolve();
  }

  consumeMessage(queue: string, callback: (message: any) => void): Promise<void> {
    return Promise.resolve();
  }
}

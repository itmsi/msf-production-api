import { Injectable } from '@nestjs/common';

@Injectable()
export class RabbitmqService {
  publishMessage(queue: string, message: any): Promise<void> {
    console.log(`Publishing message to queue ${queue}:`, message);
    return Promise.resolve();
  }

  consumeMessage(queue: string, callback: (message: any) => void): Promise<void> {
    console.log(`Consuming messages from queue ${queue}`);
    return Promise.resolve();
  }
}

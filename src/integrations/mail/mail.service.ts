import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  sendMail(to: string, subject: string, content: string): Promise<void> {
    return Promise.resolve();
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const subject = 'Password Reset Request';
    const content = `Your password reset token is: ${token}`;
    await this.sendMail(to, subject, content);
  }
}

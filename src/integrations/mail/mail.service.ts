import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendMail(to: string, subject: string, content: string): Promise<void> {
    // TODO: Implement actual email sending logic
    console.log(`Sending email to ${to}: ${subject}`);
    console.log(`Content: ${content}`);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const subject = 'Password Reset Request';
    const content = `Your password reset token is: ${token}`;
    await this.sendMail(to, subject, content);
  }
}

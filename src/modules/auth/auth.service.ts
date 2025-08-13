import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import {
  successResponse,
  throwError,
} from '../../common/helpers/response.helper';
import { CheckTokenDto, ResetPasswordDto } from './dto/reset-password.dto';
import { getResetCountdown } from '../../common/helpers/public.helper';

interface UserPayload {
  id: number;
  username: string;
  roleId: number;
  isActive: boolean;
  roles: { name: string };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throwError('Please check your account or password!', 404);
  }

  login(user: UserPayload) {
    const payload = {
      username: user.username,
      sub: user.id,
      roleId: user.roleId,
      isActive: user.isActive,
      roles: user.roles.name,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfileWithRole(userId: number) {
    const user = await this.usersService.findByIdWithRole(userId);
    if (!user) throwError('User not found', 404);
    const { password, ...result } = user ?? {};
    return result;
  }

  async sendResetPasswordEmail(email: string) {
    const sendMail = await this.usersService.sendResetPasswordEmail(email);
    return sendMail;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, password, confirmPassword } = dto;
    const user = await this.usersService.findByPassword(token);
    if (!user) {
      throwError('Invalid or expired reset token', 400);
    }
    if (password !== confirmPassword) {
      throwError('Passwords do not match', 400);
    }
    if (
      !user ||
      !user.reset_password_expires ||
      user.reset_password_expires < new Date()
    ) {
      throwError('Invalid or expired reset token', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    if (user) {
      user.password = hashedPassword;
      user.reset_password_token = null;
      user.reset_password_expires = null;

      await this.usersService.update(user.id, user);

      return { email: user.email };
    }
  }

  async cekTokenReset(dto: CheckTokenDto) {
    const { token } = dto;
    const user = await this.usersService.findByPassword(token);
    if (!user) {
      throwError('Invalid or expired reset token', 400);
    }
    if (
      !user!.reset_password_expires ||
      user!.reset_password_expires < new Date()
    ) {
      throwError('Invalid or expired reset token', 400);
    }
    return {
      email: user?.email,
      expired:
        user && user.reset_password_expires
          ? getResetCountdown(user.reset_password_expires.toISOString())
          : null,
    };
  }
}

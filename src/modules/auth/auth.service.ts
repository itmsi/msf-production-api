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
  sites_id: number;
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
      sites_id: user.sites_id,
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
}

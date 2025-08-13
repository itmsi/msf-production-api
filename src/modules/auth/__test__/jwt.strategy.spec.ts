import { JwtStrategy } from '../jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt } from 'passport-jwt';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      return null;
    }),
  };

  beforeEach(() => {
    jwtStrategy = new JwtStrategy(mockConfigService as any);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('should be initialized properly', () => {
    expect(jwtStrategy).toBeInstanceOf(JwtStrategy);
  });

  it('should validate payload and return formatted user object', () => {
    const payload = {
      sub: 1,
      username: 'admin',
      roles: ['admin'],
      roleId: 1,
      isActive: true,
      sites_id: 1,
    };

    const result = jwtStrategy.validate(payload);

    expect(result).toEqual({
      id: 1,
      username: 'admin',
      roles: ['admin'],
      roleId: 1,
      isActive: true,
      sites_id: 1,
    });
  });

  it('should return isActive as false if false', () => {
    const payload = {
      sub: 2,
      username: 'user',
      roles: ['user'],
      roleId: 2,
      isActive: false,
      sites_id: 1,
    };

    const result = jwtStrategy.validate(payload);

    expect(result).toEqual({
      id: 2,
      username: 'user',
      roles: ['user'],
      roleId: 2,
      isActive: false,
      sites_id: 1,
    });
  });
});

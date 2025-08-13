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
      isActive: true,
    };

    const result = jwtStrategy.validate(payload);
    expect(result).toEqual({
      id: 1,
      username: 'admin',
      roles: ['admin'],
      isActive: 'active',
    });
  });

  it('should return isActive as "inactive" if false', () => {
    const payload = {
      sub: 2,
      username: 'user',
      roles: ['user'],
      isActive: false,
    };

    const result = jwtStrategy.validate(payload);
    expect(result).toEqual({
      id: 2,
      username: 'user',
      roles: ['user'],
      isActive: 'inactive',
    });
  });
});

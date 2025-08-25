import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'usertest',
    description: 'Username untuk login',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  username: string;

  @ApiProperty({
    example: 'admin123',
    description: 'Password untuk login',
    minLength: 6,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Login succesfully!', description: 'Pesan response' })
  message: string;

  @ApiProperty({
    type: 'object',
    description: 'Data response login',
    properties: {
      access_token: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT access token untuk autentikasi',
      },
    },
  })
  data: {
    access_token: string;
  };
}

export class UserProfileDto {
  @ApiProperty({ example: 1, description: 'ID unik user' })
  id: number;

  @ApiProperty({ example: 'usertest', description: 'Username user' })
  username: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email user' })
  email: string;

  @ApiProperty({ example: true, description: 'Status aktif user' })
  isActive: boolean;

  @ApiProperty({ example: 1, description: 'ID employee yang terkait' })
  employee_id: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu pembuatan user',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu terakhir update user',
    required: false,
  })
  updatedAt?: Date;

  @ApiProperty({
    type: 'array',
    description: 'Array role yang dimiliki user',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        role_code: { type: 'string', example: 'ADMIN' },
        position_name: { type: 'string', example: 'Administrator' },
      },
    },
    required: false,
  })
  userRoles?: any[];

  @ApiProperty({
    type: 'object',
    description: 'Data employee yang terkait',
    properties: {
      id: { type: 'number', example: 1 },
      firstName: { type: 'string', example: 'John' },
      lastName: { type: 'string', example: 'Doe' },
      department: { type: 'string', example: 'IT' },
      position: { type: 'string', example: 'Developer' },
    },
  })
  employees?: any;
}

export class ProfileResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Get profile successfully!',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({ type: UserProfileDto, description: 'Data profile user' })
  data: UserProfileDto;
}

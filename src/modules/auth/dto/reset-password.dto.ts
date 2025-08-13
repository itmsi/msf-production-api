import { IsString, MinLength } from 'class-validator';
import { Match } from '../match.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: '{{ your token from url query param => token=xxxxxx }}',
  })
  @IsString()
  token: string;

  @ApiProperty({ example: '***********' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '***********' })
  @IsString()
  @Match('password', { message: 'Confirm password does not match' })
  confirmPassword: string;
}
export class CheckTokenDto {
  @ApiProperty({
    example: '{{ your token from url query param => token=xxxxxx }}',
  })
  @IsString()
  token: string;
}

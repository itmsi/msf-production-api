import { validate } from 'class-validator';
import { Match } from '../match.decorator';

class TestDto {
  password: string;

  @Match('password', { message: 'Confirm password must match password' })
  confirmPassword: string;
}

describe('Match decorator', () => {
  it('should succeed when values match', async () => {
    const dto = new TestDto();
    dto.password = '123456';
    dto.confirmPassword = '123456';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when values do not match', async () => {
    const dto = new TestDto();
    dto.password = '123456';
    dto.confirmPassword = '654321';

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('Match');
    expect(errors[0].constraints?.Match).toBe(
      'Confirm password must match password',
    );
  });

  it('should use default error message when no custom message provided', async () => {
    class DefaultMsgDto {
      password: string;

      @Match('password')
      confirmPassword: string;
    }

    const dto = new DefaultMsgDto();
    dto.password = 'abc';
    dto.confirmPassword = 'xyz';

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('Match');
    expect(errors[0].constraints?.Match).toBe(
      'confirmPassword must match password',
    );
  });
});

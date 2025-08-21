import { validate } from 'class-validator';
import { IsValidFloat, IsFloatInRange, IsNullableFloat, IsNullableFloatInRange } from '../number-validators';

describe('Number Validators', () => {
  describe('IsValidFloat', () => {
    class TestDto {
      @IsValidFloat()
      value: number;
    }

    it('should pass for valid float', async () => {
      const dto = new TestDto();
      dto.value = 106.8456;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass for integer', async () => {
      const dto = new TestDto();
      dto.value = 100;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail for null', async () => {
      const dto = new TestDto();
      dto.value = null as any;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isValidFloat).toBe('value harus berupa angka float yang valid');
    });

    it('should fail for undefined', async () => {
      const dto = new TestDto();
      dto.value = undefined as any;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
    });

    it('should fail for NaN', async () => {
      const dto = new TestDto();
      dto.value = NaN as any;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
    });

    it('should fail for Infinity', async () => {
      const dto = new TestDto();
      dto.value = Infinity as any;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
    });

    it('should fail for string', async () => {
      const dto = new TestDto();
      dto.value = '106.8456' as any;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
    });
  });

  describe('IsFloatInRange', () => {
    class TestDto {
      @IsFloatInRange(-180, 180)
      value: number;
    }

    it('should pass for value in range', async () => {
      const dto = new TestDto();
      dto.value = 106.8456;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass for boundary values', async () => {
      const dto = new TestDto();
      dto.value = -180;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail for value below range', async () => {
      const dto = new TestDto();
      dto.value = -181;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isFloatInRange).toBe('value harus berupa angka float antara -180 sampai 180');
    });

    it('should fail for value above range', async () => {
      const dto = new TestDto();
      dto.value = 181;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
    });
  });

  describe('IsNullableFloat', () => {
    class TestDto {
      @IsNullableFloat()
      value?: number;
    }

    it('should pass for null', async () => {
      const dto = new TestDto();
      dto.value = null;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass for undefined', async () => {
      const dto = new TestDto();
      dto.value = undefined;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass for valid float', async () => {
      const dto = new TestDto();
      dto.value = 106.8456;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail for NaN', async () => {
      const dto = new TestDto();
      dto.value = NaN as any;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNullableFloat).toBe('value harus berupa angka float yang valid atau null');
    });

    it('should fail for string', async () => {
      const dto = new TestDto();
      dto.value = '106.8456' as any;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
    });
  });

  describe('IsNullableFloatInRange', () => {
    class TestDto {
      @IsNullableFloatInRange(-90, 90)
      value?: number;
    }

    it('should pass for null', async () => {
      const dto = new TestDto();
      dto.value = null;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass for value in range', async () => {
      const dto = new TestDto();
      dto.value = -6.2088;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass for boundary values', async () => {
      const dto = new TestDto();
      dto.value = 90;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail for value below range', async () => {
      const dto = new TestDto();
      dto.value = -91;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNullableFloatInRange).toBe('value harus berupa angka float antara -90 sampai 90 atau null');
    });

    it('should fail for value above range', async () => {
      const dto = new TestDto();
      dto.value = 91;
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
    });
  });
});

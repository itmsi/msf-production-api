import { validate } from 'class-validator';
import {
  CreateBargeDto,
  UpdateBargeDto,
  GetBargesQueryDto,
} from '../dto/barge.dto';

describe('Barge DTOs', () => {
  describe('CreateBargeDto', () => {
    it('should be defined', () => {
      expect(CreateBargeDto).toBeDefined();
    });

    it('should validate valid data', async () => {
      const dto = new CreateBargeDto();
      dto.name = 'Barge Kalimantan';
      dto.capacity = 1000;
      dto.remarks = 'Test remarks';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with minimal data', async () => {
      const dto = new CreateBargeDto();
      dto.name = 'Barge Test';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate name length constraints', async () => {
      const dto = new CreateBargeDto();
      dto.name = 'A'.repeat(256); // Exceeds max length

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.maxLength).toBeDefined();
    });

    it('should validate capacity range constraints', async () => {
      const dto = new CreateBargeDto();
      dto.capacity = 0; // Below minimum

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should validate capacity maximum constraint', async () => {
      const dto = new CreateBargeDto();
      dto.capacity = 1000000; // Exceeds maximum

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.max).toBeDefined();
    });
  });

  describe('UpdateBargeDto', () => {
    it('should be defined', () => {
      expect(UpdateBargeDto).toBeDefined();
    });

    it('should validate valid data', async () => {
      const dto = new UpdateBargeDto();
      dto.name = 'Barge Kalimantan Updated';
      dto.capacity = 1500;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with partial data', async () => {
      const dto = new UpdateBargeDto();
      dto.name = 'Updated Name';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate name length constraints', async () => {
      const dto = new UpdateBargeDto();
      dto.name = 'A'.repeat(256); // Exceeds max length

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.maxLength).toBeDefined();
    });

    it('should validate capacity range constraints', async () => {
      const dto = new UpdateBargeDto();
      dto.capacity = 0; // Below minimum

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.min).toBeDefined();
    });
  });

  describe('GetBargesQueryDto', () => {
    it('should be defined', () => {
      expect(GetBargesQueryDto).toBeDefined();
    });

    it('should validate valid query parameters', async () => {
      const dto = new GetBargesQueryDto();
      dto.page = '1';
      dto.limit = '10';
      dto.search = 'test';
      dto.sortBy = 'name';
      dto.sortOrder = 'ASC';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with minimal query parameters', async () => {
      const dto = new GetBargesQueryDto();

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate page as number string', async () => {
      const dto = new GetBargesQueryDto();
      dto.page = 'invalid';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNumberString).toBeDefined();
    });

    it('should validate limit as number string', async () => {
      const dto = new GetBargesQueryDto();
      dto.limit = 'invalid';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNumberString).toBeDefined();
    });

    it('should validate search minimum length', async () => {
      const dto = new GetBargesQueryDto();
      dto.search = ''; // Empty string

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.minLength).toBeDefined();
    });

    it('should validate minCapacity as number string', async () => {
      const dto = new GetBargesQueryDto();
      dto.minCapacity = 'invalid';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNumberString).toBeDefined();
    });

    it('should validate maxCapacity as number string', async () => {
      const dto = new GetBargesQueryDto();
      dto.maxCapacity = 'invalid';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNumberString).toBeDefined();
    });
  });
});

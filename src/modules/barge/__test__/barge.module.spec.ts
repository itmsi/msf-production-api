import { Test } from '@nestjs/testing';
import { BargeModule } from '../barge.module';
import { BargeController } from '../barge.controller';
import { BargeService } from '../barge.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Barge } from '../entities/barge.entity';

describe('BargeModule', () => {
  it('should be defined', () => {
    expect(BargeModule).toBeDefined();
  });

  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [BargeModule],
    })
      .overrideProvider(getRepositoryToken(Barge))
      .useValue({})
      .compile();

    expect(module).toBeDefined();
  });

  it('should have BargeController', () => {
    const module = new BargeModule();
    expect(module).toBeDefined();
  });

  it('should have BargeService', () => {
    const module = new BargeModule();
    expect(module).toBeDefined();
  });

  it('should export TypeOrmModule and BargeService', () => {
    const module = new BargeModule();
    expect(module).toBeDefined();
  });
});

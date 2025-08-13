import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from '../roles.controller';
import { RolesService } from '../roles.service';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { CreateRolesDto, UpdateRolesDto } from '../dto/roles.dto';
import { GetRolesQueryDto } from '../dto/roles.dto';
import { ExecutionContext } from '@nestjs/common';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  const mockRolesService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Bypass JwtAuthGuard
  class MockJwtAuthGuard {
    canActivate(context: ExecutionContext) {
      return true;
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [{ provide: RolesService, useValue: mockRolesService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of roles', async () => {
      const query: GetRolesQueryDto = { page: '1', limit: '10' };
      const result = {
        statusCode: 200,
        message: 'Success',
        data: [],
        meta: { total: 0, page: 1, limit: 1 },
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      const response = await controller.findAll(query);
      expect(response).toEqual(result);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should call service.findById and return result', async () => {
      const roleId = 1;
      const role = {
        statusCode: 200,
        message: 'Role fetched successfully',
        data: { id: 1, name: 'Admin' },
      };
      jest.spyOn(service, 'findById').mockResolvedValue(role);

      expect(await controller.findOne(roleId)).toBe(role);
      expect(service.findById).toHaveBeenCalledWith(roleId);
    });
  });

  describe('create', () => {
    it('should call service.create and return result', async () => {
      const dto: CreateRolesDto = {
        roleCode: 'ADM1',
        name: 'admin',
        role_parent: 1,
      };
      const result = {
        statusCode: 201,
        message: 'Create new role successfully',
        data: { id: 1, ...dto },
      };
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should call service.update and return result', async () => {
      const id = 1;
      const dto: UpdateRolesDto = {
        roleCode: 'ADS1',
        name: 'Super Admin',
        role_parent: 1,
      };
      const result = {
        statusCode: 200,
        message: 'Roles updated successfully',
        data: { id: 1, ...dto },
      };
      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update(id, dto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove and return result', async () => {
      const id = 1;
      const result = {
        statusCode: 200,
        message: 'Roles deleted successfully',
        data: null,
      };
      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove(id)).toBe(result);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from '../roles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Roles } from '../entities/roles.entity';
import { ILike, Repository } from 'typeorm';
import { CreateRolesDto, UpdateRolesDto } from '../dto/roles.dto';
import { HttpException } from '@nestjs/common';

const mockRole = {
  id: 1,
  roleCode: 'ADMIN',
  name: 'Administrator',
  role_parent: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('RolesService', () => {
  let service: RolesService;
  let repo: Repository<Roles>;

  const mockRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Roles),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    repo = module.get<Repository<Roles>>(getRepositoryToken(Roles));
    jest.clearAllMocks();
  });

  it('should find role by name', async () => {
    mockRepository.findOne.mockResolvedValue(mockRole);
    const result = await service.findByName('Administrator');
    expect(result).toEqual(mockRole);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { name: 'Administrator' },
      withDeleted: false,
    });
  });

  it('should throw error if role not found by id', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    await expect(service.findById(99)).rejects.toThrow(HttpException);
  });

  it('should return role if found by id', async () => {
    mockRepository.findOne.mockResolvedValue(mockRole);
    const result = await service.findById(1);
    expect(result.data).toMatchObject({ id: 1, name: 'Administrator' });
  });

  it('should create new role successfully', async () => {
    const dto: CreateRolesDto = {
      roleCode: 'ADMIN',
      name: 'Administrator',
      role_parent: 1,
    };
    mockRepository.findOne.mockResolvedValue(null);
    mockRepository.create.mockReturnValue(dto);
    mockRepository.save.mockResolvedValue(mockRole);
    const result = await service.create(dto);
    expect(result.data?.name).toBe('Administrator');
  });

  it('should throw error if role already exists on create', async () => {
    mockRepository.findOne.mockResolvedValue(mockRole);
    const dto: CreateRolesDto = {
      roleCode: 'ADMIN',
      name: 'Administrator',
      role_parent: 1,
    };
    await expect(service.create(dto)).rejects.toThrow(HttpException);
  });

  it('should update role successfully', async () => {
    const dto: UpdateRolesDto = {
      name: 'Updated Admin',
      roleCode: 'ADMIN',
      role_parent: 1,
    };
    mockRepository.findOne.mockResolvedValueOnce(mockRole);
    mockRepository.findOne.mockResolvedValueOnce(null); // for roleCode check
    mockRepository.merge.mockReturnValue({ ...mockRole, ...dto });
    mockRepository.save.mockResolvedValue({ ...mockRole, ...dto });

    const result = await service.update(1, dto);
    expect(result.data?.name).toBe('Updated Admin');
  });

  it('should delete role successfully', async () => {
    mockRepository.findOne.mockResolvedValue(mockRole);
    mockRepository.softRemove.mockResolvedValue(undefined);
    const result = await service.remove(1);
    expect(result.message).toBe('Roles deleted successfully');
  });

  it('should throw error when deleting non-existent role', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    await expect(service.remove(99)).rejects.toThrow(HttpException);
  });

  it('should return paginated role list without search', async () => {
    const mockQuery = { page: '1', limit: '10' };
    mockRepository.findAndCount.mockResolvedValue([[mockRole], 1]);

    const result = await service.findAll(mockQuery);

    expect(result.data).toHaveLength(1);
    expect(result.message).toBe('Get users susccessfuly');
  });

  it('should return filtered role list when search is provided', async () => {
    const mockQuery = { page: '1', limit: '5', search: 'Admin' };
    mockRepository.findAndCount.mockResolvedValue([[mockRole], 1]);

    const result = await service.findAll(mockQuery);

    expect(result.data?.[0].name).toBe('Administrator');
  });

  it('should handle and throw internal server error', async () => {
    mockRepository.findAndCount.mockRejectedValue(new Error('DB error'));

    await expect(service.findAll({ page: '1', limit: '10' })).rejects.toThrow(
      'Failed to fetch users',
    );
  });
});

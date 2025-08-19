import { Test, TestingModule } from '@nestjs/testing';
import { PopulationController } from '../population.controller';
import { PopulationService } from '../population.service';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';

describe('PopulationController - Import', () => {
  let controller: PopulationController;
  let service: PopulationService;

  const mockPopulationService = {
    previewImport: jest.fn(),
    importData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PopulationController],
      providers: [
        {
          provide: PopulationService,
          useValue: mockPopulationService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PopulationController>(PopulationController);
    service = module.get<PopulationService>(PopulationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /import/preview', () => {
    it('should preview import CSV file', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.csv',
        encoding: '7bit',
        mimetype: 'text/csv',
        buffer: Buffer.from('test'),
        size: 4,
      } as Express.Multer.File;

      const mockPreviewResult = [
        {
          status: 'success',
          message: 'data berhasil di import',
          row: 1,
          data: {
            date_arrive: '2025-01-01',
            status: 'active',
            unit_name: 'Excavator',
            no_unit: 'EXC001',
            vin_number: 'VIN123456789',
            no_unit_system: 'SYS001',
            serial_engine: 'ENG123456',
            activities_name: 'Mining',
            user_site: 'user1',
            site_origin: 'Site A',
            remarks: 'RFU',
            site_id: '1',
            company: 'PT ABC',
            last_unit_number: 'LUN001',
            tyre_type: '6x4',
          },
        },
      ];

      mockPopulationService.previewImport.mockResolvedValue(mockPreviewResult);

      const result = await controller.previewImport(mockFile);

      expect(service.previewImport).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual(mockPreviewResult);
    });
  });

  describe('POST /import', () => {
    it('should import CSV file', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.csv',
        encoding: '7bit',
        mimetype: 'text/csv',
        buffer: Buffer.from('test'),
        size: 4,
      } as Express.Multer.File;

      const mockImportResult = {
        statusCode: 201,
        message: 'Data berhasil diimport',
        data: {
          total: 1,
          success: 1,
          failed: 0,
          details: [
            {
              status: 'success',
              message: 'Data berhasil diimport',
              row: 1,
              data: {
                date_arrive: '2025-01-01',
                status: 'active',
                unit_name: 'Excavator',
                no_unit: 'EXC001',
                vin_number: 'VIN123456789',
                no_unit_system: 'SYS001',
                serial_engine: 'ENG123456',
                activities_name: 'Mining',
                user_site: 'user1',
                site_origin: 'Site A',
                remarks: 'RFU',
                site_id: '1',
                company: 'PT ABC',
                last_unit_number: 'LUN001',
                tyre_type: '6x4',
              },
            },
          ],
        },
      };

      mockPopulationService.importData.mockResolvedValue(mockImportResult);

      const result = await controller.importData(mockFile);

      expect(service.importData).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual(mockImportResult);
    });
  });
});

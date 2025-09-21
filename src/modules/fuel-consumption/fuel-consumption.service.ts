import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, DataSource } from 'typeorm';
import { FuelConsumption } from './entities/fuel-consumption.entity';
import {
  CreateFuelConsumptionDto,
  UpdateFuelConsumptionDto,
  FuelConsumptionResponseDto,
  QueryFuelConsumptionDto,
} from './dto';
import {
  successResponse,
  emptyDataResponse,
  throwError,
  ApiResponse,
} from '../../common/helpers/response.helper';
import {
  normalizeString,
  paginateResponse,
} from '../../common/helpers/public.helper';
import {
  ImportFuelConsumptionCsvRowDto,
  ImportFuelConsumptionItemDto,
} from './dto/import-fuel-consumption.dto';
import { S3Service } from '../../integrations/s3/s3.service';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { Population } from '../population';
import { Users } from '../users/entities/users.entity';

export enum Shift {
  DS = 'DS',
  NS = 'NS',
}

@Injectable()
export class FuelConsumptionService {
  private readonly logger = new Logger(FuelConsumptionService.name);

  constructor(
    @InjectRepository(FuelConsumption)
    private readonly fuelConsumptionRepository: Repository<FuelConsumption>,
    @InjectRepository(Population)
    private readonly populationRepository: Repository<Population>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private dataSource: DataSource,
    private s3Service: S3Service,
  ) {}

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return (
      date instanceof Date &&
      !isNaN(date.getTime()) &&
      !!dateString.match(/^\d{4}-\d{2}-\d{2}$/)
    );
  }

  private isValidDateTime(dateTimeStr: string): boolean {
    // format: yyyy-mm-dd HH:mm
    const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
    if (!regex.test(dateTimeStr)) return false;

    const date = new Date(dateTimeStr.replace(' ', 'T'));
    return !isNaN(date.getTime());
  }

  private formatNumber(value: number | null | undefined): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    // Use JSON parse/stringify to handle floating point precision
    return JSON.parse(JSON.stringify(parseFloat(value.toFixed(2))));
  }

  private validateFuelConsumptionData(
    data: CreateFuelConsumptionDto | UpdateFuelConsumptionDto,
  ): void {
    // Validate now_refueling_hm vs last_refueling_hm
    if (
      data.now_refueling_hm !== undefined &&
      data.last_refueling_hm !== undefined
    ) {
      if (data.now_refueling_hm <= data.last_refueling_hm) {
        throwError(
          'now_refueling_hm tidak boleh kurang dari atau sama dengan last_refueling_hm',
          400,
        );
      }
    }

    // Validate now_refueling_km vs last_refueling_km
    if (
      data.now_refueling_km !== undefined &&
      data.last_refueling_km !== undefined
    ) {
      if (data.now_refueling_km <= data.last_refueling_km) {
        throwError(
          'now_refueling_km tidak boleh kurang dari atau sama dengan last_refueling_km',
          400,
        );
      }
    }

    // Validate end_refueling_time vs start_refueling_time
    if (data.end_refueling_time && data.start_refueling_time) {
      const startTime = new Date(data.start_refueling_time);
      const endTime = new Date(data.end_refueling_time);
      if (endTime <= startTime) {
        throwError(
          'end_refueling_time tidak boleh kurang dari atau sama dengan start_refueling_time',
          400,
        );
      }
    }
  }

  private validateFuelConsumptionUpdate(
    id: number,
    updateData: UpdateFuelConsumptionDto,
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const existingData = await this.fuelConsumptionRepository.findOne({
          where: { id },
        });

        if (!existingData) {
          reject(new Error('Fuel consumption not found'));
          return;
        }

        // For update, we need to compare with existing data if the field is not provided in update
        const dataToValidate = {
          last_refueling_hm:
            updateData.last_refueling_hm !== undefined
              ? updateData.last_refueling_hm
              : existingData.last_refueling_hm,
          now_refueling_hm:
            updateData.now_refueling_hm !== undefined
              ? updateData.now_refueling_hm
              : existingData.now_refueling_hm,
          last_refueling_km:
            updateData.last_refueling_km !== undefined
              ? updateData.last_refueling_km
              : existingData.last_refueling_km,
          now_refueling_km:
            updateData.now_refueling_km !== undefined
              ? updateData.now_refueling_km
              : existingData.now_refueling_km,
          start_refueling_time:
            updateData.start_refueling_time ||
            existingData.start_refueling_time,
          end_refueling_time:
            updateData.end_refueling_time || existingData.end_refueling_time,
        };

        // Validate now_refueling_hm vs last_refueling_hm
        if (
          dataToValidate.now_refueling_hm !== undefined &&
          dataToValidate.last_refueling_hm !== undefined
        ) {
          if (
            dataToValidate.now_refueling_hm <= dataToValidate.last_refueling_hm
          ) {
            throwError(
              'now_refueling_hm tidak boleh kurang dari atau sama dengan last_refueling_hm',
              400,
            );
          }
        }

        // Validate now_refueling_km vs last_refueling_km
        if (
          dataToValidate.now_refueling_km !== undefined &&
          dataToValidate.last_refueling_km !== undefined
        ) {
          if (
            dataToValidate.now_refueling_km <= dataToValidate.last_refueling_km
          ) {
            throwError(
              'now_refueling_km tidak boleh kurang dari atau sama dengan last_refueling_km',
              400,
            );
          }
        }

        // Validate end_refueling_time vs start_refueling_time
        if (
          dataToValidate.end_refueling_time &&
          dataToValidate.start_refueling_time
        ) {
          const startTime = new Date(dataToValidate.start_refueling_time);
          const endTime = new Date(dataToValidate.end_refueling_time);
          if (endTime <= startTime) {
            throwError(
              'end_refueling_time tidak boleh kurang dari atau sama dengan start_refueling_time',
              400,
            );
          }
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async create(
    createFuelConsumptionDto: CreateFuelConsumptionDto,
  ): Promise<any> {
    try {
      // Validate business logic
      this.validateFuelConsumptionData(createFuelConsumptionDto);

      // Calculate running_refueling_hm if both now and last are provided
      if (
        createFuelConsumptionDto.now_refueling_hm !== undefined &&
        createFuelConsumptionDto.last_refueling_hm !== undefined
      ) {
        createFuelConsumptionDto.running_refueling_hm = parseFloat(
          (
            createFuelConsumptionDto.now_refueling_hm -
            createFuelConsumptionDto.last_refueling_hm
          ).toFixed(2),
        );
      }

      // Calculate running_refueling_km if both now and last are provided
      if (
        createFuelConsumptionDto.now_refueling_km !== undefined &&
        createFuelConsumptionDto.last_refueling_km !== undefined
      ) {
        createFuelConsumptionDto.running_refueling_km = parseFloat(
          (
            createFuelConsumptionDto.now_refueling_km -
            createFuelConsumptionDto.last_refueling_km
          ).toFixed(2),
        );
      }

      // Calculate l_per_km if qty_supply and running_refueling_km are provided
      if (
        createFuelConsumptionDto.qty_supply !== undefined &&
        createFuelConsumptionDto.running_refueling_km !== undefined
      ) {
        createFuelConsumptionDto.l_per_km = parseFloat(
          (
            createFuelConsumptionDto.qty_supply /
            createFuelConsumptionDto.running_refueling_km
          ).toFixed(2),
        );
      }

      // Calculate l_per_hm if qty_supply and running_refueling_hm are provided
      if (
        createFuelConsumptionDto.qty_supply !== undefined &&
        createFuelConsumptionDto.running_refueling_hm !== undefined
      ) {
        createFuelConsumptionDto.l_per_hm = parseFloat(
          (
            createFuelConsumptionDto.qty_supply /
            createFuelConsumptionDto.running_refueling_hm
          ).toFixed(2),
        );
      }

      // Calculate lead_time_refueling_time if both start and end are provided
      if (
        createFuelConsumptionDto.start_refueling_time &&
        createFuelConsumptionDto.end_refueling_time
      ) {
        const startTime = new Date(
          createFuelConsumptionDto.start_refueling_time,
        );
        const endTime = new Date(createFuelConsumptionDto.end_refueling_time);
        createFuelConsumptionDto.lead_time_refueling_time = parseFloat(
          ((endTime.getTime() - startTime.getTime()) / (1000 * 60)).toFixed(2),
        ); // in minutes
      }

      const fuelConsumption = this.fuelConsumptionRepository.create(
        createFuelConsumptionDto,
      );
      const savedFuelConsumption =
        await this.fuelConsumptionRepository.save(fuelConsumption);

      // Reload with relations
      const fuelConsumptionWithRelations =
        await this.fuelConsumptionRepository.findOne({
          where: { id: savedFuelConsumption.id },
          relations: ['unit', 'operator'],
        });

      if (!fuelConsumptionWithRelations) {
        throwError('Failed to retrieve created fuel consumption', 500);
      }

      // Transform to response format
      const transformedData: FuelConsumptionResponseDto = {
        id: fuelConsumptionWithRelations!.id,
        unit_id: fuelConsumptionWithRelations!.unit_id,
        operator_id: fuelConsumptionWithRelations!.operator_id,
        shift: fuelConsumptionWithRelations!.shift,
        part_name: fuelConsumptionWithRelations!.part_name,
        site: '', // Will be populated if needed
        no_unit: fuelConsumptionWithRelations!.unit?.no_unit || '',
        type_unit: '', // Will be populated if needed
        serial_number: fuelConsumptionWithRelations!.unit?.vin_number || '',
        operator_name: '', // Will be populated if needed
        last_refueling_hm: this.formatNumber(
          fuelConsumptionWithRelations!.last_refueling_hm,
        ),
        now_refueling_hm: this.formatNumber(
          fuelConsumptionWithRelations!.now_refueling_hm,
        ),
        running_refueling_hm: this.formatNumber(
          fuelConsumptionWithRelations!.running_refueling_hm,
        ),
        last_refueling_km: this.formatNumber(
          fuelConsumptionWithRelations!.last_refueling_km,
        ),
        now_refueling_km: this.formatNumber(
          fuelConsumptionWithRelations!.now_refueling_km,
        ),
        running_refueling_km: this.formatNumber(
          fuelConsumptionWithRelations!.running_refueling_km,
        ),
        qty_supply: this.formatNumber(fuelConsumptionWithRelations!.qty_supply),
        uom: fuelConsumptionWithRelations!.uom,
        l_per_km: this.formatNumber(fuelConsumptionWithRelations!.l_per_km),
        l_per_hm: this.formatNumber(fuelConsumptionWithRelations!.l_per_hm),
        start_refueling_time:
          fuelConsumptionWithRelations!.start_refueling_time,
        end_refueling_time: fuelConsumptionWithRelations!.end_refueling_time,
        lead_time_refueling_time: this.formatNumber(
          fuelConsumptionWithRelations!.lead_time_refueling_time,
        ),
      };

      return successResponse(
        transformedData,
        'Fuel consumption created successfully',
        201,
      );
    } catch (error) {
      console.error('Error creating fuel consumption:', error);
      throwError('Failed to create fuel consumption', 500);
    }
  }

  async findAll(queryDto: QueryFuelConsumptionDto): Promise<any> {
    try {
      const { start_date, end_date, keyword, page = 1, limit = 10 } = queryDto;
      const skip = (page - 1) * limit;

      // Simple query first to test basic functionality
      let queryBuilder = this.fuelConsumptionRepository
        .createQueryBuilder('fuelConsumption')
        .leftJoinAndSelect('fuelConsumption.unit', 'unit')
        .leftJoinAndSelect('fuelConsumption.operator', 'operator')
        .leftJoinAndSelect('unit.site', 'site')
        .leftJoinAndSelect('unit.unitType', 'unitType')
        .leftJoinAndSelect('operator.employees', 'employees');

      // Apply date range filter
      if (start_date && end_date) {
        queryBuilder = queryBuilder.andWhere(
          'DATE(fuelConsumption.activity_date) >= :start_date AND DATE(fuelConsumption.activity_date) <= :end_date',
          { start_date, end_date },
        );
      }

      // Apply keyword filter
      if (keyword) {
        queryBuilder = queryBuilder.andWhere(
          '(fuelConsumption.part_name LIKE :keyword OR unit.no_unit LIKE :keyword OR site.name LIKE :keyword OR unitType.unit_name LIKE :keyword OR unit.vin_number LIKE :keyword OR employees.firstName LIKE :keyword OR employees.lastName LIKE :keyword)',
          { keyword: `%${keyword}%` },
        );
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      const fuelConsumptions = await queryBuilder
        .skip(skip)
        .take(limit)
        .orderBy('fuelConsumption.createdAt', 'DESC')
        .getMany();

      // Transform data to response format
      const transformedData: FuelConsumptionResponseDto[] =
        fuelConsumptions.map((item) => ({
          id: item.id,
          unit_id: item.unit_id,
          operator_id: item.operator_id,
          shift: item.shift,
          part_name: item.part_name,
          site: item.unit?.site?.name || '',
          no_unit: item.unit?.no_unit || '',
          type_unit: item.unit?.unitType?.unit_name || '',
          serial_number: item.unit?.vin_number || '',
          operator_name: item.operator?.employees
            ? `${item.operator.employees.firstName || ''} ${item.operator.employees.lastName || ''}`.trim()
            : '',
          last_refueling_hm: this.formatNumber(item.last_refueling_hm),
          now_refueling_hm: this.formatNumber(item.now_refueling_hm),
          running_refueling_hm: this.formatNumber(item.running_refueling_hm),
          last_refueling_km: this.formatNumber(item.last_refueling_km),
          now_refueling_km: this.formatNumber(item.now_refueling_km),
          running_refueling_km: this.formatNumber(item.running_refueling_km),
          qty_supply: this.formatNumber(item.qty_supply),
          uom: item.uom,
          l_per_km: this.formatNumber(item.l_per_km),
          l_per_hm: this.formatNumber(item.l_per_hm),
          start_refueling_time: item.start_refueling_time,
          end_refueling_time: item.end_refueling_time,
          lead_time_refueling_time: this.formatNumber(
            item.lead_time_refueling_time,
          ),
        }));

      if (transformedData.length === 0) {
        return emptyDataResponse('No fuel consumption data found');
      }

      // Format the entire response to ensure proper number formatting
      const formattedData = JSON.parse(
        JSON.stringify(transformedData, (key, value) => {
          if (typeof value === 'number') {
            return parseFloat(value.toFixed(2));
          }
          return value;
        }),
      );

      return paginateResponse(
        formattedData,
        total,
        page,
        limit,
        'Fuel consumption data retrieved successfully',
      );
    } catch (error) {
      throwError('Failed to retrieve fuel consumption data', 500);
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const fuelConsumption = await this.fuelConsumptionRepository.findOne({
        where: { id },
        relations: [
          'unit',
          'operator',
          'unit.site',
          'unit.unitType',
          'operator.employees',
        ],
      });

      if (!fuelConsumption) {
        return emptyDataResponse('Fuel consumption not found');
      }

      const transformedData: FuelConsumptionResponseDto = {
        id: fuelConsumption.id,
        unit_id: fuelConsumption.unit_id,
        operator_id: fuelConsumption.operator_id,
        shift: fuelConsumption.shift,
        part_name: fuelConsumption.part_name,
        site: fuelConsumption.unit?.site?.name || '',
        no_unit: fuelConsumption.unit?.no_unit || '',
        type_unit: fuelConsumption.unit?.unitType?.unit_name || '',
        serial_number: fuelConsumption.unit?.vin_number || '',
        operator_name: fuelConsumption.operator?.employees
          ? `${fuelConsumption.operator.employees.firstName || ''} ${fuelConsumption.operator.employees.lastName || ''}`.trim()
          : '',
        last_refueling_hm: this.formatNumber(fuelConsumption.last_refueling_hm),
        now_refueling_hm: this.formatNumber(fuelConsumption.now_refueling_hm),
        running_refueling_hm: this.formatNumber(
          fuelConsumption.running_refueling_hm,
        ),
        last_refueling_km: this.formatNumber(fuelConsumption.last_refueling_km),
        now_refueling_km: this.formatNumber(fuelConsumption.now_refueling_km),
        running_refueling_km: this.formatNumber(
          fuelConsumption.running_refueling_km,
        ),
        qty_supply: this.formatNumber(fuelConsumption.qty_supply),
        uom: fuelConsumption.uom,
        l_per_km: this.formatNumber(fuelConsumption.l_per_km),
        l_per_hm: this.formatNumber(fuelConsumption.l_per_hm),
        start_refueling_time: fuelConsumption.start_refueling_time,
        end_refueling_time: fuelConsumption.end_refueling_time,
        lead_time_refueling_time: this.formatNumber(
          fuelConsumption.lead_time_refueling_time,
        ),
      };

      return successResponse(
        transformedData,
        'Fuel consumption retrieved successfully',
      );
    } catch (error) {
      throwError('Failed to retrieve fuel consumption', 500);
    }
  }

  async update(
    id: number,
    updateFuelConsumptionDto: UpdateFuelConsumptionDto,
  ): Promise<any> {
    try {
      const fuelConsumption = await this.fuelConsumptionRepository.findOne({
        where: { id },
      });

      if (!fuelConsumption) {
        throw new NotFoundException('Fuel consumption not found');
      }

      // Validate business logic for update
      await this.validateFuelConsumptionUpdate(id, updateFuelConsumptionDto);

      // Calculate running_refueling_hm if both now and last are provided
      if (
        updateFuelConsumptionDto.now_refueling_hm !== undefined &&
        updateFuelConsumptionDto.last_refueling_hm !== undefined
      ) {
        updateFuelConsumptionDto.running_refueling_hm = parseFloat(
          (
            updateFuelConsumptionDto.now_refueling_hm -
            updateFuelConsumptionDto.last_refueling_hm
          ).toFixed(2),
        );
      }

      // Calculate running_refueling_km if both now and last are provided
      if (
        updateFuelConsumptionDto.now_refueling_km !== undefined &&
        updateFuelConsumptionDto.last_refueling_km !== undefined
      ) {
        updateFuelConsumptionDto.running_refueling_km = parseFloat(
          (
            updateFuelConsumptionDto.now_refueling_km -
            updateFuelConsumptionDto.last_refueling_km
          ).toFixed(2),
        );
      }

      // Calculate l_per_km if qty_supply and running_refueling_km are provided
      if (
        updateFuelConsumptionDto.qty_supply !== undefined &&
        updateFuelConsumptionDto.running_refueling_km !== undefined
      ) {
        updateFuelConsumptionDto.l_per_km = parseFloat(
          (
            updateFuelConsumptionDto.qty_supply /
            updateFuelConsumptionDto.running_refueling_km
          ).toFixed(2),
        );
      }

      // Calculate l_per_hm if qty_supply and running_refueling_hm are provided
      if (
        updateFuelConsumptionDto.qty_supply !== undefined &&
        updateFuelConsumptionDto.running_refueling_hm !== undefined
      ) {
        updateFuelConsumptionDto.l_per_hm = parseFloat(
          (
            updateFuelConsumptionDto.qty_supply /
            updateFuelConsumptionDto.running_refueling_hm
          ).toFixed(2),
        );
      }

      // Calculate lead_time_refueling_time if both start and end are provided
      if (
        updateFuelConsumptionDto.start_refueling_time &&
        updateFuelConsumptionDto.end_refueling_time
      ) {
        const startTime = new Date(
          updateFuelConsumptionDto.start_refueling_time,
        );
        const endTime = new Date(updateFuelConsumptionDto.end_refueling_time);
        updateFuelConsumptionDto.lead_time_refueling_time = parseFloat(
          ((endTime.getTime() - startTime.getTime()) / (1000 * 60)).toFixed(2),
        ); // in minutes
      }

      await this.fuelConsumptionRepository.update(id, updateFuelConsumptionDto);
      const updatedFuelConsumption =
        await this.fuelConsumptionRepository.findOne({
          where: { id },
          relations: [
            'unit',
            'operator',
            'unit.site',
            'unit.unitType',
            'operator.employees',
          ],
        });

      if (!updatedFuelConsumption) {
        throw new NotFoundException('Fuel consumption not found after update');
      }

      const transformedData: FuelConsumptionResponseDto = {
        id: updatedFuelConsumption.id,
        unit_id: updatedFuelConsumption.unit_id,
        operator_id: updatedFuelConsumption.operator_id,
        shift: updatedFuelConsumption.shift,
        part_name: updatedFuelConsumption.part_name,
        site: updatedFuelConsumption.unit?.site?.name || '',
        no_unit: updatedFuelConsumption.unit?.no_unit || '',
        type_unit: updatedFuelConsumption.unit?.unitType?.unit_name || '',
        serial_number: updatedFuelConsumption.unit?.vin_number || '',
        operator_name: updatedFuelConsumption.operator?.employees
          ? `${updatedFuelConsumption.operator.employees.firstName || ''} ${updatedFuelConsumption.operator.employees.lastName || ''}`.trim()
          : '',
        last_refueling_hm: this.formatNumber(
          updatedFuelConsumption.last_refueling_hm,
        ),
        now_refueling_hm: this.formatNumber(
          updatedFuelConsumption.now_refueling_hm,
        ),
        running_refueling_hm: this.formatNumber(
          updatedFuelConsumption.running_refueling_hm,
        ),
        last_refueling_km: this.formatNumber(
          updatedFuelConsumption.last_refueling_km,
        ),
        now_refueling_km: this.formatNumber(
          updatedFuelConsumption.now_refueling_km,
        ),
        running_refueling_km: this.formatNumber(
          updatedFuelConsumption.running_refueling_km,
        ),
        qty_supply: this.formatNumber(updatedFuelConsumption.qty_supply),
        uom: updatedFuelConsumption.uom,
        l_per_km: this.formatNumber(updatedFuelConsumption.l_per_km),
        l_per_hm: this.formatNumber(updatedFuelConsumption.l_per_hm),
        start_refueling_time: updatedFuelConsumption.start_refueling_time,
        end_refueling_time: updatedFuelConsumption.end_refueling_time,
        lead_time_refueling_time: this.formatNumber(
          updatedFuelConsumption.lead_time_refueling_time,
        ),
      };

      return successResponse(
        transformedData,
        'Fuel consumption updated successfully',
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throwError('Failed to update fuel consumption', 500);
    }
  }

  async remove(id: number): Promise<any> {
    try {
      const fuelConsumption = await this.fuelConsumptionRepository.findOne({
        where: { id },
      });

      if (!fuelConsumption) {
        throw new NotFoundException('Fuel consumption not found');
      }

      await this.fuelConsumptionRepository.softDelete(id);

      return successResponse(null, 'Fuel consumption deleted successfully');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throwError('Failed to delete fuel consumption', 500);
    }
  }

  async importData(
    file: Express.Multer.File,
    userId?: number | null,
  ): Promise<ApiResponse<any>> {
    try {
      if (!file) {
        throw new BadRequestException('File tidak ditemukan');
      }

      if (
        !file.mimetype.includes('csv') &&
        !file.originalname.endsWith('.csv')
      ) {
        throw new BadRequestException('File harus berupa CSV');
      }

      const csvData = await this.parseCsvFile(file.buffer);
      const importResults: ImportFuelConsumptionItemDto[] = [];
      let successCount = 0;
      let failedCount = 0;
      const errorRows: any[] = [];
      const successRows: any[] = [];

      // Validasi semua data terlebih dahulu
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        const rowNumber = i + 1;

        try {
          const validation = await this.validateCsvRow(row);

          if (validation.isValid) {
            successRows.push({ row: rowNumber, data: row });
            importResults.push({
              status: 'success',
              message: 'Data valid',
              row: rowNumber,
              data: row,
            });
          } else {
            failedCount++;
            errorRows.push({
              row: rowNumber,
              data: row,
              errors: validation.errors,
            });
            importResults.push({
              status: 'error',
              message: validation.message,
              row: rowNumber,
              data: row,
            });
          }
        } catch (error) {
          failedCount++;
          errorRows.push({
            row: rowNumber,
            data: row,
            errors: [
              {
                field: 'general',
                message: error.message || 'Gagal validasi data',
              },
            ],
          });
          importResults.push({
            status: 'error',
            message: error.message || 'Gagal validasi data',
            row: rowNumber,
            data: row,
          });
        }
      }
      // Jika ada error, buat file error dan return tanpa insert ke database
      if (errorRows.length > 0) {
        this.logger.log(
          `Found ${errorRows.length} rows with errors, generating error CSV...`,
        );

        try {
          const errorCsvBuffer = this.generateErrorCsv(errorRows);
          this.logger.log('Error CSV generated successfully');

          // Coba upload ke MinIO, jika gagal gunakan fallback
          let errorFileInfo: { key: string; downloadUrl: string } | null = null;
          let minioAvailable = false;

          try {
            // Test koneksi MinIO terlebih dahulu
            minioAvailable = await this.s3Service.testConnection();

            if (minioAvailable) {
              errorFileInfo = await this.s3Service.uploadErrorFile(
                `import_error_${Date.now()}.csv`,
                errorCsvBuffer,
                'ewh_import_error',
              );

              if (errorFileInfo) {
                this.logger.log('Error file uploaded to MinIO successfully');
              } else {
                this.logger.warn(
                  'MinIO upload failed, using fallback response',
                );
                minioAvailable = false;
              }
            } else {
              this.logger.warn(
                'MinIO tidak tersedia, menggunakan fallback response',
              );
            }
          } catch (s3Error) {
            this.logger.warn(
              'MinIO error, menggunakan fallback response:',
              s3Error.message,
            );
            minioAvailable = false;
          }

          const response = {
            total: csvData.length,
            success: 0,
            failed: failedCount,
            details: importResults,
            error_file:
              errorFileInfo && minioAvailable
                ? {
                    download_url: errorFileInfo.downloadUrl,
                    message:
                      'File error telah diupload ke cloud storage. Silakan download dan perbaiki data sebelum import ulang.',
                  }
                : {
                    download_url: null,
                    message:
                      'File error gagal diupload ke cloud storage. Silakan periksa data error di response details.',
                  },
          };

          return successResponse(
            response,
            'Import dibatalkan karena ada data yang tidak valid',
          );
        } catch (error) {
          this.logger.error('Error generating error CSV:', error);
          this.logger.error('Error stack:', error.stack);

          // Fallback response tanpa file error
          const response = {
            total: csvData.length,
            success: 0,
            failed: failedCount,
            details: importResults,
            error_file: {
              download_url: null,
              message:
                'Gagal generate file error. Silakan periksa data error di response details.',
            },
          };

          return successResponse(
            response,
            'Import dibatalkan karena ada data yang tidak valid',
          );
        }
      }

      // Jika semua data valid, lakukan import dengan transaction
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        for (const rowData of successRows) {
          await this.importCsvRow(rowData.data, userId);
          successCount++;
        }

        await queryRunner.commitTransaction();

        const response = {
          total: csvData.length,
          success: successCount,
          failed: 0,
          details: importResults,
        };

        return successResponse(response, 'Data berhasil diimport');
      } catch (error) {
        await queryRunner.rollbackTransaction();
        if (error?.response && error?.response?.statusCode === 400) {
          throw error;
        }
        throw new InternalServerErrorException(
          `Gagal import data: ${error.message}`,
        );
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal import CSV');
    }
  }

  private async parseCsvFile(
    buffer: Buffer,
  ): Promise<ImportFuelConsumptionCsvRowDto[]> {
    return new Promise((resolve, reject) => {
      const results: ImportFuelConsumptionCsvRowDto[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csv())
        .on('data', (data) => {
          results.push({
            activity_date: data.activity_date || '',
            no_unit: data.no_unit || '',
            operator_name: data.operator_name || '',
            shift: data.shift || '',
            part_name: data.part_name || '',
            uom: data.uom || '',
            now_refueling_hm: data.now_refueling_hm || '',
            last_refueling_hm: data.last_refueling_hm || '',
            now_refueling_km: data.now_refueling_km || '',
            last_refueling_km: data.last_refueling_km || '',
            start_refueling_time: data.start_refueling_time || '',
            end_refueling_time: data.end_refueling_time || '',
            qty_supply: data.qty_supply || 0,
          });
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  private async validateCsvRow(row: ImportFuelConsumptionCsvRowDto): Promise<{
    isValid: boolean;
    message: string;
    errors: Array<{ field: string; message: string }>;
  }> {
    const errors: Array<{ field: string; message: string }> = [];

    // Validasi required fields
    if (!row.activity_date) {
      errors.push({
        field: 'activity_date',
        message: 'Tanggal Aktifitas wajib diisi',
      });
    }
    if (!row.no_unit) {
      errors.push({ field: 'no_unit', message: 'Nomor unit wajib diisi' });
    }
    if (!row.shift) {
      errors.push({ field: 'shift', message: 'Shift wajib diisi' });
    }
    if (!row.uom) {
      errors.push({ field: 'uom', message: 'UOM wajib diisi' });
    }
    // if (!row.part_name) {
    //   errors.push({ field: 'part_name', message: 'Part Name wajib diisi' });
    // }
    if (!row.now_refueling_hm) {
      errors.push({
        field: 'now_refueling_hm',
        message: 'Start Refueling HM wajib diisi',
      });
    }

    if (!row.last_refueling_hm) {
      errors.push({
        field: 'last_refueling_hm',
        message: 'Last Refueling HM wajib diisi',
      });
    }

    if (!row.now_refueling_km) {
      errors.push({
        field: 'now_refueling_km',
        message: 'Start Refueling KM wajib diisi',
      });
    }

    if (!row.last_refueling_km) {
      errors.push({
        field: 'last_refueling_km',
        message: 'Start Refueling KM wajib diisi',
      });
    }

    if (!row.start_refueling_time) {
      errors.push({
        field: 'start_refueling_time',
        message: 'Start Time wajib diisi',
      });
    }

    if (!row.end_refueling_time) {
      errors.push({
        field: 'stop_time',
        message: 'Stop Time wajib diisi',
      });
    }

    // Validasi format date
    if (row.activity_date && !this.isValidDate(row.activity_date)) {
      errors.push({
        field: 'activity_date',
        message: 'Format tanggal tidak valid (yyyy-mm-dd)',
      });
    }

    if (
      row.start_refueling_time &&
      !this.isValidDateTime(row.start_refueling_time)
    ) {
      errors.push({
        field: 'start_refueling_time',
        message: 'Format start time tidak valid (yyyy-mm-dd HH:mm)',
      });
    }

    if (
      row.end_refueling_time &&
      !this.isValidDateTime(row.end_refueling_time)
    ) {
      errors.push({
        field: 'end_refueling_time',
        message: 'Format stop time tidak valid (yyyy-mm-dd HH:mm)',
      });
    }

    if (row.shift && !['NS', 'DS'].includes(row.shift.toUpperCase())) {
      errors.push({
        field: 'Shift',
        message: 'Shift harus NS atau DS',
      });
    }

    if (row.no_unit) {
      const noUnit = await this.populationRepository
        .createQueryBuilder('p')
        .where('LOWER(p.no_unit) = LOWER(:no_unit)', {
          no_unit: normalizeString(row.no_unit),
        })
        .getOne();

      if (!noUnit) {
        errors.push({
          field: 'no_unit',
          message: `No Unit "${row.no_unit}" tidak ditemukan`,
        });
      }
    }

    if (row.operator_name) {
      const operator = await this.usersRepository
        .createQueryBuilder('u')
        .leftJoin('m_employee', 'me', 'me.id = u.employee_id')
        .where('LOWER(u.username) LIKE LOWER(:username)', {
          username: `%${row.operator_name}%`,
        })
        .getOne();
      if (!operator) {
        errors.push({
          field: 'operator',
          message: `Operator "${row.operator_name}" tidak ditemukan`,
        });
      }
    }

    const isValid = errors.length === 0;

    // Buat message yang lebih detail
    let message = 'Data valid';
    if (!isValid) {
      if (errors.length === 1) {
        const error = errors[0];
        message = `Field "${error.field}" tidak valid: ${error.message}`;
      } else {
        const errorDetails = errors
          .map((err) => `"${err.field}": ${err.message}`)
          .join(', ');
        message = `${errors.length} field(s) tidak valid: ${errorDetails}`;
      }
    }

    return { isValid, message, errors };
  }

  private async importCsvRow(
    row: ImportFuelConsumptionCsvRowDto,
    userId?: number | null,
  ): Promise<void> {
    const [population, operator] = await Promise.all([
      this.populationRepository
        .createQueryBuilder('p')
        .where('LOWER(p.no_unit) = LOWER(:no_unit)', {
          no_unit: normalizeString(row.no_unit),
        })
        .getOne(),
      this.usersRepository
        .createQueryBuilder('u')
        .leftJoin('m_employee', 'm', 'm.id = u.employee_id')
        .where('LOWER(u.username) LIKE LOWER(:username)', {
          username: `%${row.operator_name}%`,
        })
        .getOne(),
    ]);

    if (!population) {
      throw new BadRequestException('No Unit tidak ditemukan');
    }

    if (!operator) {
      throw new BadRequestException('Problem tidak ditemukan');
    }

    const fuelConsumptionData: CreateFuelConsumptionDto = {
      activity_date: row.activity_date,
      unit_id: population.id,
      shift: row.shift.toUpperCase() as Shift,
      part_name: row.part_name,
      operator_id: operator.id,
      now_refueling_hm: Number(row.now_refueling_hm),
      last_refueling_hm: Number(row.last_refueling_hm),
      now_refueling_km: Number(row.now_refueling_km),
      last_refueling_km: Number(row.last_refueling_km),
      qty_supply: Number(row.qty_supply),
      uom: row.uom,
      start_refueling_time: row.start_refueling_time,
      end_refueling_time: row.end_refueling_time,
    };

    await this.create(fuelConsumptionData);
  }

  private generateErrorCsv(errorRows: any[]): Buffer {
    try {
      // Header dengan kolom error
      const headers = [
        'row_number',
        'error_details',
        'activity_date',
        'part_name',
        'operator_name',
        'last_refueling_hm',
        'now_refueling_hm',
        'last_refueling_km',
        'now_refueling_km',
        'qty_supply',
        'uom',
        'start_refueling_time',
        'end_refueling_time',
        'shift',
      ];

      // Buat CSV content secara manual
      let csvContent = headers.join(',') + '\n';

      // Tambahkan data dengan error
      errorRows.forEach((errorRow) => {
        const rowData = errorRow.data;
        const errors = errorRow.errors;
        // Gabungkan semua error message
        const errorMessages = errors
          .map((err) => `${err.field}: ${err.message}`)
          .join('; ');

        const csvRow = [
          errorRow.row,
          `"${errorMessages}"`, // Wrap dalam quotes untuk menghindari masalah dengan comma
          rowData.activity_date || '',
          rowData.no_unit || '',
          rowData.part_name || '',
          rowData.shift || '',
          rowData.uom || '',
          rowData.now_refueling_hm || '',
          rowData.last_refueling_hm || '',
          rowData.now_refueling_km || '',
          rowData.last_refueling_km || '',
          rowData.start_time || '',
          rowData.stop_time || '',
        ];

        csvContent += csvRow.join(',') + '\n';
      });

      return Buffer.from(csvContent, 'utf-8');
    } catch (error) {
      this.logger.error('Error in generateErrorCsv:', error);
      throw error;
    }
  }
}

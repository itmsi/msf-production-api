import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
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
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';

@Injectable()
export class FuelConsumptionService {
  constructor(
    @InjectRepository(FuelConsumption)
    private readonly fuelConsumptionRepository: Repository<FuelConsumption>,
  ) {}

  private formatNumber(value: number | null | undefined): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    // Use JSON parse/stringify to handle floating point precision
    return JSON.parse(JSON.stringify(parseFloat(value.toFixed(2))));
  }

  async create(createFuelConsumptionDto: CreateFuelConsumptionDto): Promise<any> {
    try {
      // Calculate running_refueling_hm if both now and last are provided
      if (createFuelConsumptionDto.now_refueling_hm && createFuelConsumptionDto.last_refueling_hm) {
        createFuelConsumptionDto.running_refueling_hm = 
          parseFloat((createFuelConsumptionDto.now_refueling_hm - createFuelConsumptionDto.last_refueling_hm).toFixed(2));
      }

      // Calculate running_refueling_km if both now and last are provided
      if (createFuelConsumptionDto.now_refueling_km && createFuelConsumptionDto.last_refueling_km) {
        createFuelConsumptionDto.running_refueling_km = 
          parseFloat((createFuelConsumptionDto.now_refueling_km - createFuelConsumptionDto.last_refueling_km).toFixed(2));
      }

      // Calculate l_per_km if qty_supply and running_refueling_km are provided
      if (createFuelConsumptionDto.qty_supply && createFuelConsumptionDto.running_refueling_km) {
        createFuelConsumptionDto.l_per_km = 
          parseFloat((createFuelConsumptionDto.qty_supply / createFuelConsumptionDto.running_refueling_km).toFixed(2));
      }

      // Calculate l_per_hm if qty_supply and running_refueling_hm are provided
      if (createFuelConsumptionDto.qty_supply && createFuelConsumptionDto.running_refueling_hm) {
        createFuelConsumptionDto.l_per_hm = 
          parseFloat((createFuelConsumptionDto.qty_supply / createFuelConsumptionDto.running_refueling_hm).toFixed(2));
      }

      // Calculate lead_time_refueling_time if both start and end are provided
      if (createFuelConsumptionDto.start_refueling_time && createFuelConsumptionDto.end_refueling_time) {
        const startTime = new Date(createFuelConsumptionDto.start_refueling_time);
        const endTime = new Date(createFuelConsumptionDto.end_refueling_time);
        createFuelConsumptionDto.lead_time_refueling_time = 
          parseFloat(((endTime.getTime() - startTime.getTime()) / (1000 * 60)).toFixed(2)); // in minutes
      }

      const fuelConsumption = this.fuelConsumptionRepository.create(createFuelConsumptionDto);
      const savedFuelConsumption = await this.fuelConsumptionRepository.save(fuelConsumption);
      
      // Reload with relations
      const fuelConsumptionWithRelations = await this.fuelConsumptionRepository.findOne({
        where: { id: savedFuelConsumption.id },
        relations: ['unit', 'operator', 'unit.site', 'unit.unitType', 'operator.employees'],
      });

      if (!fuelConsumptionWithRelations) {
        throwError('Failed to retrieve created fuel consumption', 500);
      }

      // Transform to response format
      const transformedData: FuelConsumptionResponseDto = {
        id: fuelConsumptionWithRelations!.id,
        shift: fuelConsumptionWithRelations!.shift,
        part_name: fuelConsumptionWithRelations!.part_name,
        site: fuelConsumptionWithRelations!.unit?.site?.name || '',
        no_unit: fuelConsumptionWithRelations!.unit?.no_unit || '',
        type_unit: fuelConsumptionWithRelations!.unit?.unitType?.unit_name || '',
        serial_number: fuelConsumptionWithRelations!.unit?.vin_number || '',
        operator_name: fuelConsumptionWithRelations!.operator?.employees ? `${fuelConsumptionWithRelations!.operator.employees.firstName || ''} ${fuelConsumptionWithRelations!.operator.employees.lastName || ''}`.trim() : '',
        last_refueling_hm: this.formatNumber(fuelConsumptionWithRelations!.last_refueling_hm),
        now_refueling_hm: this.formatNumber(fuelConsumptionWithRelations!.now_refueling_hm),
        running_refueling_hm: this.formatNumber(fuelConsumptionWithRelations!.running_refueling_hm),
        last_refueling_km: this.formatNumber(fuelConsumptionWithRelations!.last_refueling_km),
        now_refueling_km: this.formatNumber(fuelConsumptionWithRelations!.now_refueling_km),
        running_refueling_km: this.formatNumber(fuelConsumptionWithRelations!.running_refueling_km),
        qty_supply: this.formatNumber(fuelConsumptionWithRelations!.qty_supply),
        uom: fuelConsumptionWithRelations!.uom,
        l_per_km: this.formatNumber(fuelConsumptionWithRelations!.l_per_km),
        l_per_hm: this.formatNumber(fuelConsumptionWithRelations!.l_per_hm),
        start_refueling_time: fuelConsumptionWithRelations!.start_refueling_time,
        end_refueling_time: fuelConsumptionWithRelations!.end_refueling_time,
        lead_time_refueling_time: this.formatNumber(fuelConsumptionWithRelations!.lead_time_refueling_time),
      };

      return successResponse(transformedData, 'Fuel consumption created successfully', 201);
    } catch (error) {
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
          { start_date, end_date }
        );
      }

      // Apply keyword filter
      if (keyword) {
        queryBuilder = queryBuilder.andWhere(
          '(fuelConsumption.part_name LIKE :keyword OR unit.no_unit LIKE :keyword OR site.name LIKE :keyword OR unitType.unit_name LIKE :keyword OR unit.vin_number LIKE :keyword OR employees.firstName LIKE :keyword OR employees.lastName LIKE :keyword)',
          { keyword: `%${keyword}%` }
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
      const transformedData: FuelConsumptionResponseDto[] = fuelConsumptions.map((item) => ({
        id: item.id,
        shift: item.shift,
        part_name: item.part_name,
        site: item.unit?.site?.name || '',
        no_unit: item.unit?.no_unit || '',
        type_unit: item.unit?.unitType?.unit_name || '',
        serial_number: item.unit?.vin_number || '',
        operator_name: item.operator?.employees ? `${item.operator.employees.firstName || ''} ${item.operator.employees.lastName || ''}`.trim() : '',
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
        lead_time_refueling_time: this.formatNumber(item.lead_time_refueling_time),
      }));

      if (transformedData.length === 0) {
        return emptyDataResponse('No fuel consumption data found');
      }

      // Format the entire response to ensure proper number formatting
      const formattedData = JSON.parse(JSON.stringify(transformedData, (key, value) => {
        if (typeof value === 'number') {
          return parseFloat(value.toFixed(2));
        }
        return value;
      }));

      return paginateResponse(
        formattedData,
        total,
        page,
        limit,
        'Fuel consumption data retrieved successfully'
      );
    } catch (error) {
      throwError('Failed to retrieve fuel consumption data', 500);
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const fuelConsumption = await this.fuelConsumptionRepository.findOne({
        where: { id },
        relations: ['unit', 'operator', 'unit.site', 'unit.unitType', 'operator.employees'],
      });

      if (!fuelConsumption) {
        return emptyDataResponse('Fuel consumption not found');
      }

      const transformedData: FuelConsumptionResponseDto = {
        id: fuelConsumption.id,
        shift: fuelConsumption.shift,
        part_name: fuelConsumption.part_name,
        site: fuelConsumption.unit?.site?.name || '',
        no_unit: fuelConsumption.unit?.no_unit || '',
        type_unit: fuelConsumption.unit?.unitType?.unit_name || '',
        serial_number: fuelConsumption.unit?.vin_number || '',
        operator_name: fuelConsumption.operator?.employees ? `${fuelConsumption.operator.employees.firstName || ''} ${fuelConsumption.operator.employees.lastName || ''}`.trim() : '',
        last_refueling_hm: this.formatNumber(fuelConsumption.last_refueling_hm),
        now_refueling_hm: this.formatNumber(fuelConsumption.now_refueling_hm),
        running_refueling_hm: this.formatNumber(fuelConsumption.running_refueling_hm),
        last_refueling_km: this.formatNumber(fuelConsumption.last_refueling_km),
        now_refueling_km: this.formatNumber(fuelConsumption.now_refueling_km),
        running_refueling_km: this.formatNumber(fuelConsumption.running_refueling_km),
        qty_supply: this.formatNumber(fuelConsumption.qty_supply),
        uom: fuelConsumption.uom,
        l_per_km: this.formatNumber(fuelConsumption.l_per_km),
        l_per_hm: this.formatNumber(fuelConsumption.l_per_hm),
        start_refueling_time: fuelConsumption.start_refueling_time,
        end_refueling_time: fuelConsumption.end_refueling_time,
        lead_time_refueling_time: this.formatNumber(fuelConsumption.lead_time_refueling_time),
      };

      return successResponse(transformedData, 'Fuel consumption retrieved successfully');
    } catch (error) {
      throwError('Failed to retrieve fuel consumption', 500);
    }
  }

  async update(id: number, updateFuelConsumptionDto: UpdateFuelConsumptionDto): Promise<any> {
    try {
      const fuelConsumption = await this.fuelConsumptionRepository.findOne({
        where: { id },
      });

      if (!fuelConsumption) {
        throw new NotFoundException('Fuel consumption not found');
      }

      // Calculate running_refueling_hm if both now and last are provided
      if (updateFuelConsumptionDto.now_refueling_hm && updateFuelConsumptionDto.last_refueling_hm) {
        updateFuelConsumptionDto.running_refueling_hm = 
          parseFloat((updateFuelConsumptionDto.now_refueling_hm - updateFuelConsumptionDto.last_refueling_hm).toFixed(2));
      }

      // Calculate running_refueling_km if both now and last are provided
      if (updateFuelConsumptionDto.now_refueling_km && updateFuelConsumptionDto.last_refueling_km) {
        updateFuelConsumptionDto.running_refueling_km = 
          parseFloat((updateFuelConsumptionDto.now_refueling_km - updateFuelConsumptionDto.last_refueling_km).toFixed(2));
      }

      // Calculate l_per_km if qty_supply and running_refueling_km are provided
      if (updateFuelConsumptionDto.qty_supply && updateFuelConsumptionDto.running_refueling_km) {
        updateFuelConsumptionDto.l_per_km = 
          parseFloat((updateFuelConsumptionDto.qty_supply / updateFuelConsumptionDto.running_refueling_km).toFixed(2));
      }

      // Calculate l_per_hm if qty_supply and running_refueling_hm are provided
      if (updateFuelConsumptionDto.qty_supply && updateFuelConsumptionDto.running_refueling_hm) {
        updateFuelConsumptionDto.l_per_hm = 
          parseFloat((updateFuelConsumptionDto.qty_supply / updateFuelConsumptionDto.running_refueling_hm).toFixed(2));
      }

      // Calculate lead_time_refueling_time if both start and end are provided
      if (updateFuelConsumptionDto.start_refueling_time && updateFuelConsumptionDto.end_refueling_time) {
        const startTime = new Date(updateFuelConsumptionDto.start_refueling_time);
        const endTime = new Date(updateFuelConsumptionDto.end_refueling_time);
        updateFuelConsumptionDto.lead_time_refueling_time = 
          parseFloat(((endTime.getTime() - startTime.getTime()) / (1000 * 60)).toFixed(2)); // in minutes
      }

      await this.fuelConsumptionRepository.update(id, updateFuelConsumptionDto);
      const updatedFuelConsumption = await this.fuelConsumptionRepository.findOne({
        where: { id },
        relations: ['unit', 'operator', 'unit.site', 'unit.unitType', 'operator.employees'],
      });

      if (!updatedFuelConsumption) {
        throw new NotFoundException('Fuel consumption not found after update');
      }

      const transformedData: FuelConsumptionResponseDto = {
        id: updatedFuelConsumption.id,
        shift: updatedFuelConsumption.shift,
        part_name: updatedFuelConsumption.part_name,
        site: updatedFuelConsumption.unit?.site?.name || '',
        no_unit: updatedFuelConsumption.unit?.no_unit || '',
        type_unit: updatedFuelConsumption.unit?.unitType?.unit_name || '',
        serial_number: updatedFuelConsumption.unit?.vin_number || '',
        operator_name: updatedFuelConsumption.operator?.employees ? `${updatedFuelConsumption.operator.employees.firstName || ''} ${updatedFuelConsumption.operator.employees.lastName || ''}`.trim() : '',
        last_refueling_hm: this.formatNumber(updatedFuelConsumption.last_refueling_hm),
        now_refueling_hm: this.formatNumber(updatedFuelConsumption.now_refueling_hm),
        running_refueling_hm: this.formatNumber(updatedFuelConsumption.running_refueling_hm),
        last_refueling_km: this.formatNumber(updatedFuelConsumption.last_refueling_km),
        now_refueling_km: this.formatNumber(updatedFuelConsumption.now_refueling_km),
        running_refueling_km: this.formatNumber(updatedFuelConsumption.running_refueling_km),
        qty_supply: this.formatNumber(updatedFuelConsumption.qty_supply),
        uom: updatedFuelConsumption.uom,
        l_per_km: this.formatNumber(updatedFuelConsumption.l_per_km),
        l_per_hm: this.formatNumber(updatedFuelConsumption.l_per_hm),
        start_refueling_time: updatedFuelConsumption.start_refueling_time,
        end_refueling_time: updatedFuelConsumption.end_refueling_time,
        lead_time_refueling_time: this.formatNumber(updatedFuelConsumption.lead_time_refueling_time),
      };

      return successResponse(transformedData, 'Fuel consumption updated successfully');
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
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { BargeForm } from './entities/barge-form.entity';
import {
  CreateBargeFormDto,
  UpdateBargeFormDto,
  BargeFormResponseDto,
  QueryBargeFormDto,
} from './dto';
import {
  successResponse,
  successResponseWithMeta,
  emptyDataResponse,
  throwError,
} from '../../common/helpers/response.helper';

@Injectable()
export class BargeFormService {
  constructor(
    @InjectRepository(BargeForm)
    private readonly bargeFormRepository: Repository<BargeForm>,
  ) {}

  async create(createBargeFormDto: CreateBargeFormDto): Promise<any> {
    try {
      // Calculate capacity_per_dt if both vol_by_survey and total_vessel are provided
      if (createBargeFormDto.vol_by_survey && createBargeFormDto.total_vessel) {
        createBargeFormDto.capacity_per_dt = 
          createBargeFormDto.vol_by_survey / createBargeFormDto.total_vessel;
      }

      // Calculate achievment if both vol_by_survey and capacity_per_dt are provided
      if (createBargeFormDto.vol_by_survey && createBargeFormDto.capacity_per_dt) {
        createBargeFormDto.achievment = 
          Number((createBargeFormDto.vol_by_survey / createBargeFormDto.capacity_per_dt).toFixed(2));
      }

      const bargeForm = this.bargeFormRepository.create(createBargeFormDto);
      const savedBargeForm = await this.bargeFormRepository.save(bargeForm);
      
      // Reload with relations
      const bargeFormWithRelations = await this.bargeFormRepository.findOne({
        where: { id: savedBargeForm.id },
        relations: ['barge', 'site'],
      });

      if (!bargeFormWithRelations) {
        throwError('Failed to retrieve created barge form', 500);
      }

      // Transform to response format
      const transformedData: BargeFormResponseDto = {
        id: bargeFormWithRelations!.id,
        shipment: bargeFormWithRelations!.shipment,
        barge_name: bargeFormWithRelations!.barge?.name || '',
        site_name: bargeFormWithRelations!.site?.name || '',
        start_loading: bargeFormWithRelations!.start_loading,
        end_loading: bargeFormWithRelations!.end_loading,
        total_vessel: bargeFormWithRelations!.total_vessel ? Number(bargeFormWithRelations!.total_vessel.toFixed(2)) : null,
        vol_by_survey: bargeFormWithRelations!.vol_by_survey ? Number(bargeFormWithRelations!.vol_by_survey.toFixed(2)) : null,
        capacity_per_dt: bargeFormWithRelations!.capacity_per_dt ? Number(bargeFormWithRelations!.capacity_per_dt.toFixed(2)) : null,
        achievment: bargeFormWithRelations!.achievment ? Number(bargeFormWithRelations!.achievment.toFixed(2)) : null,
        remarks: bargeFormWithRelations!.remarks,
        status: bargeFormWithRelations!.status,
      };

      return successResponse(transformedData, 'Barge form created successfully', 201);
    } catch (error) {
      throwError('Failed to create barge form', 500);
    }
  }

  async findAll(queryDto: QueryBargeFormDto): Promise<any> {
    try {
      const { start_date, end_date, keyword, page = 1, limit = 10 } = queryDto;
      const skip = (page - 1) * limit;

      const queryBuilder = this.bargeFormRepository
        .createQueryBuilder('bargeForm')
        .leftJoinAndSelect('bargeForm.barge', 'barge')
        .leftJoinAndSelect('bargeForm.site', 'site');

      // Apply date range filter
      if (start_date && end_date) {
        queryBuilder.andWhere(
          'bargeForm.start_loading >= :start_date AND bargeForm.end_loading <= :end_date',
          { 
            start_date: new Date(start_date + 'T00:00:00.000Z'),
            end_date: new Date(end_date + 'T23:59:59.999Z')
          }
        );
      }

      // Apply keyword filter
      if (keyword) {
        queryBuilder.andWhere(
          '(barge.name LIKE :keyword OR site.name LIKE :keyword OR bargeForm.shipment LIKE :keyword OR bargeForm.remarks LIKE :keyword)',
          { keyword: `%${keyword}%` }
        );
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      const bargeForms = await queryBuilder
        .skip(skip)
        .take(limit)
        .orderBy('bargeForm.createdAt', 'DESC')
        .getMany();

      // Transform data to response format
      const transformedData: BargeFormResponseDto[] = bargeForms.map((item) => ({
        id: item.id,
        shipment: item.shipment,
        barge_name: item.barge?.name || '',
        site_name: item.site?.name || '',
        start_loading: item.start_loading,
        end_loading: item.end_loading,
        total_vessel: item.total_vessel ? Number(item.total_vessel.toFixed(2)) : null,
        vol_by_survey: item.vol_by_survey ? Number(item.vol_by_survey.toFixed(2)) : null,
        capacity_per_dt: item.capacity_per_dt ? Number(item.capacity_per_dt.toFixed(2)) : null,
        achievment: item.achievment ? Number(item.achievment.toFixed(2)) : null,
        remarks: item.remarks,
        status: item.status,
      }));

      if (transformedData.length === 0) {
        return emptyDataResponse('No barge forms found');
      }

      return successResponseWithMeta(
        transformedData,
        'Barge forms retrieved successfully',
        200,
        {
          total,
          page,
          limit,
        }
      );
    } catch (error) {
      throwError('Failed to retrieve barge forms', 500);
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const bargeForm = await this.bargeFormRepository.findOne({
        where: { id },
        relations: ['barge', 'site'],
      });

      if (!bargeForm) {
        return emptyDataResponse('Barge form not found');
      }

      const transformedData: BargeFormResponseDto = {
        id: bargeForm.id,
        shipment: bargeForm.shipment,
        barge_name: bargeForm.barge?.name || '',
        site_name: bargeForm.site?.name || '',
        start_loading: bargeForm.start_loading,
        end_loading: bargeForm.end_loading,
        total_vessel: bargeForm.total_vessel ? Number(bargeForm.total_vessel.toFixed(2)) : null,
        vol_by_survey: bargeForm.vol_by_survey ? Number(bargeForm.vol_by_survey.toFixed(2)) : null,
        capacity_per_dt: bargeForm.capacity_per_dt ? Number(bargeForm.capacity_per_dt.toFixed(2)) : null,
        achievment: bargeForm.achievment ? Number(bargeForm.achievment.toFixed(2)) : null,
        remarks: bargeForm.remarks,
        status: bargeForm.status,
      };

      return successResponse(transformedData, 'Barge form retrieved successfully');
    } catch (error) {
      throwError('Failed to retrieve barge form', 500);
    }
  }

  async update(id: number, updateBargeFormDto: UpdateBargeFormDto): Promise<any> {
    try {
      const bargeForm = await this.bargeFormRepository.findOne({
        where: { id },
      });

      if (!bargeForm) {
        throw new NotFoundException('Barge form not found');
      }

      // Calculate capacity_per_dt if both vol_by_survey and total_vessel are provided
      if (updateBargeFormDto.vol_by_survey && updateBargeFormDto.total_vessel) {
        updateBargeFormDto.capacity_per_dt = 
          updateBargeFormDto.vol_by_survey / updateBargeFormDto.total_vessel;
      }

      // Calculate achievment if both vol_by_survey and capacity_per_dt are provided
      if (updateBargeFormDto.vol_by_survey && updateBargeFormDto.capacity_per_dt) {
        updateBargeFormDto.achievment = 
          updateBargeFormDto.vol_by_survey / updateBargeFormDto.capacity_per_dt;
      }

      await this.bargeFormRepository.update(id, updateBargeFormDto);
      const updatedBargeForm = await this.bargeFormRepository.findOne({
        where: { id },
        relations: ['barge', 'site'],
      });

      if (!updatedBargeForm) {
        throw new NotFoundException('Barge form not found after update');
      }

      const transformedData: BargeFormResponseDto = {
        id: updatedBargeForm.id,
        shipment: updatedBargeForm.shipment,
        barge_name: updatedBargeForm.barge?.name || '',
        site_name: updatedBargeForm.site?.name || '',
        start_loading: updatedBargeForm.start_loading,
        end_loading: updatedBargeForm.end_loading,
        total_vessel: updatedBargeForm.total_vessel,
        vol_by_survey: updatedBargeForm.vol_by_survey,
        capacity_per_dt: updatedBargeForm.capacity_per_dt,
        achievment: updatedBargeForm.achievment,
        remarks: updatedBargeForm.remarks,
        status: updatedBargeForm.status,
      };

      return successResponse(transformedData, 'Barge form updated successfully');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throwError('Failed to update barge form', 500);
    }
  }

  async remove(id: number): Promise<any> {
    try {
      const bargeForm = await this.bargeFormRepository.findOne({
        where: { id },
      });

      if (!bargeForm) {
        throw new NotFoundException('Barge form not found');
      }

      await this.bargeFormRepository.softDelete(id);

      return successResponse(null, 'Barge form deleted successfully');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throwError('Failed to delete barge form', 500);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DailySummaryProductionQueryDto } from './dto/daily-summary-production.dto';

@Injectable()
export class DailySummaryProductionService {
  constructor(private dataSource: DataSource) {}

  async getDailySummaryProduction(filters: DailySummaryProductionQueryDto) {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // Build dynamic query with filters
      let query = `
        SELECT 
            dt_type,
            unit,
            date,
            material_type,
            vessel,
            tonnage,
            hujan,
            slippery
        FROM get_summary_production_with_loss_time_v2($1, $2)
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      // Add date range filter
      if (filters.startDate) {
        query += ` AND date >= $${paramIndex}`;
        params.push(filters.startDate);
        paramIndex++;
      }

      if (filters.endDate) {
        query += ` AND date <= $${paramIndex}`;
        params.push(filters.endDate);
        paramIndex++;
      }

      // Add dt_type filter
      if (filters.dtType) {
        query += ` AND dt_type = $${paramIndex}`;
        params.push(filters.dtType);
        paramIndex++;
      }

      // Add material filter
      if (filters.material) {
        query += ` AND material_type ILIKE $${paramIndex}`;
        params.push(`%${filters.material}%`);
        paramIndex++;
      }

      // Add ordering
      query += ` ORDER BY date DESC, unit ASC`;

      const result = await queryRunner.query(query, params);

      await queryRunner.release();

      return {
        statusCode: 200,
        message: 'success',
        data: result,
      };
    } catch (error) {
      console.error('Error executing get_summary_production_with_loss_time:', error);
      return {
        statusCode: 500,
        message: 'Error executing daily summary production query',
        error: error.message,
      };
    }
  }
}

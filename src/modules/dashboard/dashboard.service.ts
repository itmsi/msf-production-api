import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(private dataSource: DataSource) {}
  async getSpiderData() {
    return {
      statusCode: 200,
      message: 'success',
      data: [
        { metric: 'CT', target: 100, actual: 80, percent: 80 },
        { metric: 'Prod', target: 120, actual: 90, percent: 75 },
        { metric: 'EWH', target: 90, actual: 70, percent: 78 },
        { metric: 'FR', target: 95, actual: 95, percent: 100 },
        { metric: 'Speed', target: 110, actual: 100, percent: 91 },
      ],
    };
  }

  async getMtdAchievement() {
    return {
      statusCode: 200,
      message: 'success',
      data: [
        { name: 'Ore Hauling', target: 10000, actual: 8500 },
        { name: 'OB', target: 12000, actual: 10000 },
        { name: 'Ore Barging', target: 9000, actual: 8700 },
        { name: 'Quarry', target: 8000, actual: 7500 },
      ],
    };
  }

  async getHaulingData() {
    return {
      statusCode: 200,
      message: 'success',
      data: [
        { date: '01/07', target: 2500, actual: 2000, slippery: 5, rain: 8 },
        { date: '02/07', target: 2500, actual: 1800, slippery: 4, rain: 6 },
        { date: '03/07', target: 2500, actual: 1700, slippery: 6, rain: 7 },
        { date: '04/07', target: 2500, actual: 2200, slippery: 8, rain: 9 },
        { date: '05/07', target: 2500, actual: 2100, slippery: 10, rain: 5 },
        { date: '06/07', target: 2500, actual: 1900, slippery: 7, rain: 8 },
        { date: '07/07', target: 2500, actual: 2300, slippery: 9, rain: 10 },
      ],
    };
  }

  async getBargeData() {
    return {
      statusCode: 200,
      message: 'success',
      data: [
        { date: '01/07', barge: 3000, hauling: 2800 },
        { date: '02/07', barge: 2950, hauling: 2700 },
        { date: '03/07', barge: 2980, hauling: 2750 },
        { date: '04/07', barge: 2900, hauling: 2600 },
        { date: '05/07', barge: 3000, hauling: 2700 },
        { date: '06/07', barge: 2800, hauling: 2500 },
        { date: '07/07', barge: 2900, hauling: 2650 },
      ],
    };
  }

  async getTmmData() {
    return {
      statusCode: 200,
      message: 'success',
      data: [
        { date: '01/07', ore: 500, over: 1400, tmm: 2000 },
        { date: '02/07', ore: 700, over: 1600, tmm: 2400 },
        { date: '03/07', ore: 800, over: 1000, tmm: 1800 },
        { date: '04/07', ore: 900, over: 1500, tmm: 2500 },
        { date: '05/07', ore: 600, over: 1700, tmm: 3000 },
        { date: '06/07', ore: 700, over: 1200, tmm: 2100 },
      ],
    };
  }

  async getLostTimeData() {
    return {
      statusCode: 200,
      message: 'success',
      data: [
        { name: 'Slippery', value: 30 },
        { name: 'Rain', value: 7 },
        { name: 'Waiting Hauler', value: 1 },
        { name: 'Rest & Meals', value: 1 },
        { name: 'Daily shift', value: 1 },
        { name: 'Friday pray', value: 1 },
      ],
    };
  }

  async getDailyAchievement() {
    return {
      statusCode: 200,
      message: 'success',
      data: [
        {
          title: 'Daily ACV',
          details: [
            { name: 'Ore Hauling', target: 10000, actual: 8500 },
            { name: 'OB', target: 12000, actual: 10000 },
            { name: 'Ore Barging', target: 9000, actual: 8700 },
            { name: 'Quarry', target: 8000, actual: 7500 },
          ],
        },
        {
          title: 'Day Shift ACV',
          details: [
            { name: 'Ore Hauling', target: 10000, actual: 8500 },
            { name: 'OB', target: 12000, actual: 10000 },
            { name: 'Ore Barging', target: 9000, actual: 8700 },
            { name: 'Quarry', target: 8000, actual: 7500 },
          ],
        },
        {
          title: 'Night Shift ACV',
          details: [
            { name: 'Ore Hauling', target: 10000, actual: 8500 },
            { name: 'OB', target: 12000, actual: 10000 },
            { name: 'Ore Barging', target: 9000, actual: 8700 },
            { name: 'Quarry', target: 8000, actual: 7500 },
          ],
        },
      ],
    };
  }

  async getBargeList() {
    return {
      statusCode: 200,
      message: 'success',
      data: {
        list: [
          {
            barge_name: 'Barge Alpha',
            start_loading: '2025-09-01 08:00',
            finish_load: '2025-09-01 14:30',
            capacity: 12000,
            total_vessel: 1,
            vol_by_draft: 11800,
            capacity_per_dt: 95,
            acv: 92,
            remarks: 'Smooth operation',
          },
        ],
        details: [
          { title: 'Capacity', value: 130000 },
          { title: 'Vessel', value: 3100 },
          { title: 'Vol By Draft', value: 123123 },
          { title: 'ACV', value: 500 },
        ],
      },
    };
  }

  async getBargeStatus() {
    return {
      statusCode: 200,
      message: 'success',
      data: {
        barging_ore: [
          {
            name: 'progress',
            value: 10,
            fill: '#3BAF9F',
          },
        ],
        list: [
          {
            variable: 'Barge',
            target: 100,
            actual: 90,
            dev: 6,
            percent: 12,
          },
        ],
        gain_lost: [
          { name: 'Target', value: 9000, type: 'increase', base: 0, height: 9000 },
          { name: 'PDTY', value: 1000, type: 'increase', base: 9000, height: 1000 },
          { name: 'PA', value: 1500, type: 'increase', base: 10000, height: 1500 },
          { name: 'UA', value: -2000, type: 'decrease', base: 11500, height: 2000 },
          { name: 'Actual', value: 9500, type: 'total', base: 0, height: 9500 },
        ],
      },
    };
  }

  async getLostTimeSummary() {
    return {
      statusCode: 200,
      message: 'success',
      data: {
        mohh: [
          { name: 'STB', value: 2224.3, color: '#34d399' },
          { name: 'BD', value: 1.1, color: '#d1d5db' },
          { name: 'EWH', value: 270.6, color: '#10b981' },
        ],
        lost_time: [
          { name: 'Rain', value: 0.3, color: '#1e3a8a' },
          { name: 'Slippery', value: 0.1, color: '#d1d5db' },
          { name: 'MHR', value: 0.25, color: '#34d399' },
          { name: 'Internal', value: 0.2, color: '#fbbf24' },
          { name: 'External', value: 0.35, color: '#60a5fa' },
        ],
        tables: [
          {
            title: 'PA',
            data: [
              {
                target: 1000,
                actual: 1000,
                percent: 10,
              },
            ],
          },
          {
            title: 'MA',
            data: [
              {
                target: 1000,
                actual: 1000,
                percent: 10,
              },
            ],
          },
          {
            title: 'UA',
            data: [
              {
                target: 1000,
                actual: 1000,
                percent: 10,
              },
            ],
          },
          {
            title: 'EU',
            data: [
              {
                target: 1000,
                actual: 1000,
                percent: 10,
              },
            ],
          },
        ],
      },
    };
  }

  async getMonthlyStatus(month: string) {
    return {
      statusCode: 200,
      message: 'success',
      data: [
        {
          title: 'OB Removing',
          target: 3000,
          chart_data: [
            {
              name: 'progress',
              value: 10,
              fill: '#3BAF9F',
            },
          ],
          weekness: 123,
          achievement: 123.123218,
        },
        {
          title: 'Ore Hauling',
          target: 2950,
          chart_data: [
            {
              name: 'progress',
              value: 40,
              fill: '#3BAF9F',
            },
          ],
          weekness: 123,
          achievement: 2700,
        },
        {
          title: 'Ore Barging',
          target: 2980,
          chart_data: [
            {
              name: 'progress',
              value: 62.88,
              fill: '#3BAF9F',
            },
          ],
          weekness: 123,
          achievement: 2750,
        },
        {
          title: 'Quarry',
          target: 2950,
          chart_data: [
            {
              name: 'progress',
              value: 23,
              fill: '#3BAF9F',
            },
          ],
          weekness: 123,
          achievement: 2800,
        },
      ],
    };
  }

  async getTrendHaulingBarging(month: string) {
    return {
      statusCode: 200,
      message: 'success',
      data: [
        { date: '01/07', ore_barging: 2500, ore_hauling: 2000, slippery: 5, rain: 8 },
        { date: '02/07', ore_barging: 2500, ore_hauling: 1800, slippery: 4, rain: 6 },
        { date: '03/07', ore_barging: 2500, ore_hauling: 1700, slippery: 6, rain: 7 },
        { date: '04/07', ore_barging: 2500, ore_hauling: 2200, slippery: 8, rain: 9 },
        { date: '05/07', ore_barging: 2500, ore_hauling: 2100, slippery: 10, rain: 5 },
        { date: '06/07', ore_barging: 2500, ore_hauling: 1900, slippery: 7, rain: 8 },
        { date: '07/07', ore_barging: 2500, ore_hauling: 2300, slippery: 9, rain: 10 },
        { date: '08/07', ore_barging: 2500, ore_hauling: 2100, slippery: 6, rain: 6 },
        { date: '09/07', ore_barging: 2500, ore_hauling: 2000, slippery: 5, rain: 7 },
        { date: '10/07', ore_barging: 2500, ore_hauling: 1800, slippery: 8, rain: 8 },
        { date: '11/07', ore_barging: 2500, ore_hauling: 2100, slippery: 7, rain: 9 },
        { date: '12/07', ore_barging: 2500, ore_hauling: 2000, slippery: 6, rain: 7 },
        { date: '12/07', ore_barging: 2500, ore_hauling: 2000, slippery: 6, rain: 7 },
        { date: '12/07', ore_barging: 2500, ore_hauling: 2000, slippery: 6, rain: 7 },
        { date: '12/07', ore_barging: 2500, ore_hauling: 2000, slippery: 6, rain: 7 },
        { date: '12/07', ore_barging: 2500, ore_hauling: 2000, slippery: 6, rain: 7 },
        { date: '12/07', ore_barging: 2500, ore_hauling: 2000, slippery: 6, rain: 7 },
        { date: '12/07', ore_barging: 2500, ore_hauling: 2000, slippery: 6, rain: 7 },
      ],
    };
  }

  async getTrendFuelRatio(month: string) {
    return {
      statusCode: 200,
      message: 'success',
      data: {
        chart: [
          { date: '01/07', fr: 2500, sr: 2000 },
          { date: '02/07', fr: 2500, sr: 1800 },
          { date: '03/07', fr: 2500, sr: 1700 },
          { date: '04/07', fr: 2500, sr: 2200 },
          { date: '05/07', fr: 2500, sr: 2100 },
          { date: '06/07', fr: 2500, sr: 1900 },
          { date: '07/07', fr: 2500, sr: 2300 },
          { date: '08/07', fr: 2500, sr: 2100 },
          { date: '09/07', fr: 2500, sr: 2000 },
          { date: '10/07', fr: 2500, sr: 1800 },
          { date: '11/07', fr: 2500, sr: 2100 },
          { date: '12/07', fr: 2500, sr: 2000 },
        ],
        meta: [
          { key: 'fr', label: 'FR', color: '#D96C06', yAxis: 'left' },
          { key: 'sr', label: 'SR', color: '#3E7D70', yAxis: 'left' },
        ],
      },
    };
  }

  async getTrendPerformanceUnit(month: string) {
    return {
      statusCode: 200,
      message: 'success',
      data: {
        chart: [
          { date: '01/07', pa: 2500, ma: 200, ua: 2000, eu: 2000 },
          { date: '02/07', pa: 2500, ma: 18200, ua: 1800, eu: 1800 },
        ],
        meta: [
          { key: 'pa', label: 'PA', color: '#D96C06', yAxis: 'left' },
          { key: 'ma', label: 'MA', color: '#3E7D70', yAxis: 'left' },
          { key: 'ua', label: 'UA', color: '#54AD9B', yAxis: 'left' },
          { key: 'eu', label: 'EU', color: '#D7EED2', yAxis: 'left' },
        ],
      },
    };
  }

  async getSummaryProduction() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      
      const result = await queryRunner.query('SELECT * FROM get_summary_production()');
      
      await queryRunner.release();
      
      return {
        statusCode: 200,
        message: 'success',
        data: result,
      };
    } catch (error) {
      console.error('Error executing get_summary_production:', error);
      return {
        statusCode: 500,
        message: 'Error executing stored procedure',
        error: error.message,
      };
    }
  }
}

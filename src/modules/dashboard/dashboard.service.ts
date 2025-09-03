import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
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
}

import { BadRequestException, Injectable } from "@nestjs/common";
import { BargingSummaryResponseDto, CcrActivitesResponseDto, FleetStatusResponseDto, ResponseDto, TonnageResponseDto } from "./dto/ccr-dashboard.dto";


@Injectable()
export class CcrDashboardService {
  constructor(
  ) {}

  async getHaulingSummary() : Promise<ResponseDto> {
          try {
              return {
                  statusCode: 200,
                  message: 'success',
                  data: {
                    total_mp: 24,
                    attendance: [
                            { name: 'Hadir', value: 16, color: '#54AD9B' },
                            { name: 'Sakit', value: 2, color: '#54AD9B' },
                            { name: 'Izin', value: 1, color: '#54AD9B' },
                            { name: 'Alpa', value: 1, color: '#FF0000' },
                            { name: 'Cuti', value: 1, color: '#F1C40F' },
                            { name: 'Punishment', value: 1, color: '#F1C40F' },
                            { name: 'Standby', value: 1, color: '#F1C40F' },
                        ],
                        chart_summary: [
                            {
                                title: 'Tonnage',
                                meta: {
                                    actual: 4000,
                                    target: 8000,
                                    percent: 50,
                                },
                            },
                            {
                                title: 'Vessel',
                                meta: {
                                    actual: 5000,
                                    target: 13000,
                                    percent: 38,
                                },
                            },
                            {
                                title: 'Ore',
                                meta: {
                                    actual: 2000,
                                    target: 10000,
                                    percent: 20,
                                },
                            },
                            {
                                title: 'Quarry',
                                meta: {
                                    actual: 2000,
                                    target: 10000,
                                    percent: 20,
                                },
                            },
                            {
                                title: 'OB',
                                meta: {
                                    actual: 2000,
                                    target: 10000,
                                    percent: 20,
                                },
                            },
                ],
                working_hour: [
                    { title: 'EWH', value: 10 },
                    { title: 'STB', value: 50 },
                ]
                }    
              };
          } catch (error){
              throw new BadRequestException(`Gagal mendapatkan data`); 
          }
      }

      async getFleetStatus() : Promise<FleetStatusResponseDto> {
          try {
              return {
                  statusCode: 200,
                  message: 'success',
                  data: [
                    {
                        fleet: 'TID-DT-001',
                        start_loading: 'ETO 1',
                        loading_point: 'EFO 1',
                        dumping_point: 'string',
                        target_hauler: 123,
                        actual_hauler: 123,
                        mf: 123,
                        total_vessel: 123,
                        total_tonnage: 123,
                        ore: 123,
                        quarry: 123,
                        ob: 123,
                    },
                    {
                        fleet: 'TID-DT-002',
                        start_loading: 'ETO 1',
                        loading_point: 'EFO 1',
                        dumping_point: 'string',
                        target_hauler: 123,
                        actual_hauler: 123,
                        mf: 123,
                        total_vessel: 123,
                        total_tonnage: 123,
                        ore: 123,
                        quarry: 123,
                        ob: 123,
                    },
                    {
                        fleet: 'TID-DT-003',
                        start_loading: 'ETO 1',
                        loading_point: 'EFO 1',
                        dumping_point: 'string',
                        target_hauler: 123,
                        actual_hauler: 123,
                        mf: 123,
                        total_vessel: 123,
                        total_tonnage: 123,
                        ore: 123,
                        quarry: 123,
                        ob: 123,
                    },
                  ] 
              };
          } catch (error){
              throw new BadRequestException(`Gagal mendapatkan data`); 
          }
      }

      async getTonnage() : Promise<TonnageResponseDto> {
          try {
              return {
                  statusCode: 200,
                  message: 'success',
                  data: {
                    chart: [
                        {
                            hour: '18-19',
                            'TID-EX-013': 1,
                            'DT-TR-001': 3,
                            'HD-EX-777': 5,
                            total: 8,
                        },
                        {
                            hour: '19-20',
                            'TID-EX-013': 2,
                            'DT-TR-001': 4,
                            'HD-EX-777': 6,
                            total: 12,
                        },
                    ],
                    meta: {
                        'TID-EX-013': '#F6C89F',
                        'DT-TR-001': '#94D1B2',
                        'HD-EX-777': '#54AD9B',
                        total: '#D96C06',
                    },
                  }
              };
          } catch (error){
              throw new BadRequestException(`Gagal mendapatkan data`); 
          }
      }

      async getBargingSummary() : Promise<BargingSummaryResponseDto> {
          try {
              return {
                  statusCode: 200,
                  message: 'success',
                  data: [
                    {
                        title: 'Unit Running',
                        meta: {
                            actual: 4000,
                            target: 8000,
                            percent: 50,
                        },
                    },
                    {
                        title: 'Tonnage',
                        meta: {
                            actual: 5000,
                            target: 13000,
                            percent: 38,
                        },
                    },
                    {
                        title: 'Vessel',
                        meta: {
                            actual: 2000,
                            target: 10000,
                            percent: 20,
                        },
                    },
                ]
              };
          } catch (error){
              throw new BadRequestException(`Gagal mendapatkan data`); 
          }
      }

      async getActivities() : Promise<CcrActivitesResponseDto> {
          try {
              return {
                statusCode: 200,
                message: 'success',
                data: [
                    { label: 'No Operator', target: 3000, actual: 2800 },
                    { label: 'Fogging', target: 2950, actual: 2700 },
                    { label: 'Friday Pray', target: 2980, actual: 2750 },
                    { label: 'Hujan', target: 2900, actual: 2600 },
                    { label: 'P2H', target: 3000, actual: 2700 },
                    { label: 'Perbaikan Front Loading', target: 2800, actual: 2500 },
                    { label: 'Refueling', target: 2900, actual: 2650 },
                    { label: 'Rest Time', target: 3000, actual: 2700 },
                    { label: 'Safety Talk', target: 2950, actual: 2800 },
                ]
            };
          } catch (error){
              throw new BadRequestException(`Gagal mendapatkan data`); 
          }
      }
}
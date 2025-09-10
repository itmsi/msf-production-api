import { BadRequestException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { DayProductionItemDto, DayProductionQueryDto, MtdProductionItemDto, MtdProductionQueryDto } from "./dto/mtd-production.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseDataPro } from "../base-data-production";
import { EffectiveWorkingHours, LossType } from "../effective-working-hours";
import { paginateResponse } from "src/common";
import moment from "moment";

@Injectable()
export class MtdProductionService {
    constructor(
        @InjectRepository(BaseDataPro)
        private readonly baseDataProductionRepository: Repository<BaseDataPro>,
        @InjectRepository(EffectiveWorkingHours)
        private readonly effectiveWorkingHoursRepository: Repository<EffectiveWorkingHours>,
    ) {}

    async getMtdProduction(filters: MtdProductionQueryDto) {
        try {
            const page = parseInt(filters.page ?? '1', 10);
            const limit = parseInt(filters.limit ?? '10', 10);

            const qb = this.baseDataProductionRepository
                .createQueryBuilder('bdp')
                .leftJoinAndSelect('bdp.parentBaseDataPro', 'ppp')
                .leftJoinAndSelect('ppp.population', 'pop')
                .where('pop.site_id = 1');

            var duration = 0;
            if (filters.startDate || filters.endDate) {
                const startDate = new Date(filters.startDate || '');
                const endDate = new Date(filters.endDate || '');

                duration = this.calculateDuration(startDate, endDate) || 0;

                qb.andWhere('ppp.activityDate BETWEEN :start AND :end', { start: startDate, end: endDate });
            }

            const [result, total] = await qb.getManyAndCount();

            // Group by activity_date, tyre_type, no_unit, shift
            const grouped: Record<string, any> = {};

            for (const item of result) {
                const unit = item.parentBaseDataPro.population.no_unit;
                const tyreType = item.parentBaseDataPro.population.tyre_type;
                const activityDate = item.parentBaseDataPro.activityDate;
                const shift = item.parentBaseDataPro.shift;
                
                if (!unit) continue;

                const groupKey = `${activityDate}_${tyreType}_${unit}_${shift}`;

                if (!grouped[groupKey]) {
                    grouped[groupKey] = {
                        activity_date: moment(activityDate).format('YYYY-MM-DD'),
                        tyre_type: tyreType,
                        no_unit: unit,
                        shift: shift.toLowerCase(),
                        mohh: duration * 24,
                        standby_time: 0,
                        breakdown_time: 0,
                        ewh_time: 0,
                        km: 0,
                        hm: 0,
                        speed: 0,
                        ct: 0,
                        pa: 0,
                        ua: 0,
                        ma: 0,
                        eu: 0,
                        ore_hauling: 0,
                        quarry: 0,
                        ob: 0,
                        boulder: 0,
                        ore_barge: 0,
                        ore_hauling_tonnage: 0,
                        quarry_tonnage: 0,
                        ore_barge_tonnage: 0,
                        boulder_tonnage: 0,
                        ob_tonnage: 0,
                        sr: 0
                    };
                }

                // Accumulate data
                grouped[groupKey].km += Number(item.totalKm || 0);
                grouped[groupKey].hm += Number(item.totalHm || 0);

                // Calculate material counts
                if (item.material === 'ore' && item.activity === 'hauling') {
                    grouped[groupKey].ore_hauling += Number(item.totalVessel || 0);
                }
                if (item.material === 'ore' && item.activity === 'barging') {
                    grouped[groupKey].ore_barge += Number(item.totalVessel || 0);
                }
                if (item.material === 'quarry') {
                    grouped[groupKey].quarry += Number(item.totalVessel || 0);
                }
                if (item.material === 'boulder') {
                    grouped[groupKey].boulder += Number(item.totalVessel || 0);
                }
                if (item.material === 'ob') {
                    grouped[groupKey].ob += Number(item.totalVessel || 0);
                }
            }

            // Calculate breakdown time and other metrics for each group
            for (const groupKey in grouped) {
                const group = grouped[groupKey];
                
                // Get breakdown time from r_loss_time table
                const breakdownTime = await this.getBreakdownTime(
                    group.no_unit,
                    group.activity_date,
                    group.shift
                );
                group.breakdown_time = breakdownTime;

                // Calculate standby time: mohh - breakdown - ewh
                group.ewh_time = group.hm; // ewh_time == hm
                group.standby_time = group.mohh - group.breakdown_time - group.ewh_time;

                // Calculate speed: km / hm
                group.speed = group.hm > 0 ? group.km / group.hm : 0;

                // Calculate CT: hm / (ore_hauling + ore_barge + quarry + ob + boulder)
                const totalVessel = group.ore_hauling + group.ore_barge + group.quarry + group.ob + group.boulder;
                group.ct = totalVessel > 0 ? group.hm / totalVessel : 0;

                // Calculate tonnage based on tyre type
                if (group.tyre_type === '6x4') {
                    group.ore_hauling_tonnage = group.ore_hauling * 26.56;
                    group.quarry_tonnage = group.quarry * 16.6;
                    group.ore_barge_tonnage = group.ore_barge * 16.6; // Different factor for ore_barge
                    group.boulder_tonnage = group.boulder * 26.56;
                    group.ob_tonnage = (group.ob * 26.56) / 1.6;
                } else if (group.tyre_type === '8x4') {
                    group.ore_hauling_tonnage = group.ore_hauling * 29.56;
                    group.quarry_tonnage = group.quarry * 18.26;
                    group.ore_barge_tonnage = group.ore_barge * 18.26; // Different factor for ore_barge
                    group.boulder_tonnage = group.boulder * 29.56;
                    group.ob_tonnage = (group.ob * 29.56) / 1.6;
                }

                // Calculate SR: ob_tonnage / ore_hauling_tonnage
                group.sr = group.ore_hauling_tonnage > 0 ? group.ob_tonnage / group.ore_hauling_tonnage : 0;

                // Calculate availability metrics
                // PA: (ewh + standby_time) / mohh
                group.pa = group.mohh > 0 ? (group.ewh_time + group.standby_time) / group.mohh : 0;

                // UA: ewh / (ewh + standby_time)
                const ewhPlusStandby = group.ewh_time + group.standby_time;
                group.ua = ewhPlusStandby > 0 ? group.ewh_time / ewhPlusStandby : 0;

                // MA: ewh / (ewh + breakdown_time)
                const ewhPlusBreakdown = group.ewh_time + group.breakdown_time;
                group.ma = ewhPlusBreakdown > 0 ? group.ewh_time / ewhPlusBreakdown : 0;

                // EU: ewh / mohh
                group.eu = group.mohh > 0 ? group.ewh_time / group.mohh : 0;
            }

            const groupedResult = Object.values(grouped);

            // Apply pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedData = groupedResult.slice(startIndex, endIndex);
            const totalPages = Math.ceil(groupedResult.length / limit);

            return {
                statusCode: 200,
                message: 'Data berhasil diambil',
                data: paginatedData,
                pagination: {
                    total: groupedResult.length,
                    page: page,
                    limit: limit,
                    lastPage: totalPages
                }
            };
        } catch (error) {
            throw new BadRequestException(`Gagal mendapatkan data: ${error.message}`);
        }
    }

    async getDayProduction(filters: DayProductionQueryDto){
        try {
            const page = parseInt(filters.page ?? '1', 10);
            const limit = parseInt(filters.limit ?? '10', 10);

            let selectedDate: Date | undefined;
            if (filters.selectedDate){
                selectedDate = moment(filters.selectedDate, 'YYYY-MM-DD').toDate();
            }

            const qb =  this.baseDataProductionRepository
                .createQueryBuilder('bdp')
                .leftJoinAndSelect('bdp.parentBaseDataPro','ppp')
                .leftJoinAndSelect('ppp.population','pop')
                .where('pop.site_id = :site_id', { site_id: 1 })

            
            if (selectedDate){
                qb.andWhere('ppp.activityDate = :selectedDate', { selectedDate: selectedDate });
            }

            const [result, total] = await qb.getManyAndCount();

            console.log(result);

            const transformedResult: DayProductionItemDto[] = [];

            result.forEach((item) => {
                const mohh = 24;
                const activityDate = moment(item.parentBaseDataPro.activityDate).format('YYYY-MM-DD');
                const tyreType = item.parentBaseDataPro.population.tyre_type;
                const pa = 0;
                const ma = 0;
                const ua = 0;
                const eu = 0;
                const shift = item.parentBaseDataPro.shift;
                const sr = 0;

                const totalVessel = Number(item.totalVessel) || 0;
                transformedResult.push({
                    id: item.parentBaseDataPro.id,
                    no_unit: item.parentBaseDataPro.population.no_unit,
                    activity_date: activityDate,
                    standby_time: 0,
                    breakdown_time: 0,
                    shift: shift.toUpperCase(),
                    tyre_type: tyreType,
                    ewh_time: mohh,
                    pa: pa,
                    ma: ma,
                    ua: ua,
                    eu: eu,
                    mohh: mohh,
                    
                    ore_hauling: item.material === 'ore' && item.activity === 'hauling' ? totalVessel : 0,
                    ore_barge: item.material === 'ore-barge' && item.activity === 'barging' ? totalVessel : 0,
                    quarry: item.material === 'quarry' ? totalVessel : 0,
                    ob: item.material === 'ob' ? totalVessel : 0,
                    boulder: item.material === 'boulder' ? totalVessel : 0,

                    ore_hauling_tonnage: 
                        item.material === 'ore' && 
                        item.activity === 'hauling' ?
                        item.parentBaseDataPro.population.tyre_type === '6x4' ?
                        totalVessel * 26.56 : totalVessel * 29.56 : 0,
                    ore_barge_tonnage: 
                        item.material === 'ore-barge' &&
                        item.activity === 'barging' ? 
                        item.parentBaseDataPro.population.tyre_type === '6x4' ?
                        totalVessel * 26.56 : totalVessel * 29.56 : 0,
                    quarry_tonnage: 
                        item.material === 'quarry' ?
                        item.parentBaseDataPro.population.tyre_type === '6x4' ?
                        totalVessel * 16.6 : totalVessel * 18.26 : 0,
                    ob_tonnage: 
                        item.material === 'ob' ?
                        item.parentBaseDataPro.population.tyre_type === '6x4' ?
                        totalVessel * 26.56 : totalVessel * 29.56 : 0,
                    boulder_tonnage: 
                        item.material === 'boulder' ?
                        item.parentBaseDataPro.population.tyre_type === '6x4' ? 
                        totalVessel * 29.56 : 
                        totalVessel * 26.56 : 0,
                    
                    sr: sr
                })
             });

            return paginateResponse(
                    transformedResult,
                    total,
                    page,
                    limit,
                    'Data berhasil diambil',
                  );
        } catch (error){
            throw new BadRequestException(`Gagal mendapatkan data: ${error.message}`); 
        }
    }

    async getMtdWorkHour(filters: MtdProductionQueryDto){
        try {
            return {
                statusCode: 200,
                message: 'success',
                data: [],
            };
        } catch (error){
            throw new BadRequestException(`Gagal mendapatkan data`); 
        }
    }

    async getDayWorkHour(filters: MtdProductionQueryDto){
         try {
            return {
                statusCode: 200,
                message: 'success',
                data: [],
            };
        } catch (error){
            throw new BadRequestException(`Gagal mendapatkan data`); 
        }
    }

    private async getBreakdownTime(noUnit: string, activityDate: string, shift: string): Promise<number> {
        try {
            const result = await this.effectiveWorkingHoursRepository
                .createQueryBuilder('rlt')
                .leftJoin('rlt.population', 'pop')
                .where('pop.no_unit = :noUnit', { noUnit })
                .andWhere('rlt.dateActivity = :activityDate', { activityDate })
                .andWhere('rlt.shift = :shift', { shift: shift.toUpperCase() })
                .andWhere('rlt.lossType = :lossType', { lossType: LossType.BD })
                .select('SUM(rlt.duration)', 'totalBreakdown')
                .getRawOne();

            return Number(result?.totalBreakdown || 0);
        } catch (error) {
            console.error('Error calculating breakdown time:', error);
            return 0;
        }
    }

    private calculateDuration(start: Date, finish: Date): number {
        const diffMs = finish.getTime() - start.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return Math.round(diffDays * 100) / 100; // Round to 2 decimal places
    }
}
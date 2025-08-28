import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class NumberFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return this.formatNumbers(data);
      }),
    );
  }

  private formatNumbers(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'number') {
      // Jika data adalah number, format ke 2 digit di belakang koma
      return Number(data.toFixed(2));
    }

    if (typeof data === 'string') {
      // Jika data adalah string, cek apakah bisa dikonversi ke number
      const num = parseFloat(data);
      if (!isNaN(num)) {
        return Number(num.toFixed(2));
      }
      return data;
    }

    if (Array.isArray(data)) {
      // Jika data adalah array, format setiap elemen
      return data.map((item) => this.formatNumbers(item));
    }

    if (typeof data === 'object') {
      // Jika data adalah object, format hanya field numeric/pecahan
      const formattedData: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Skip field yang tidak boleh diformat (tanggal, boolean, string non-numeric)
        if (this.shouldSkipFormatting(key, value)) {
          formattedData[key] = value;
        } else {
          formattedData[key] = this.formatNumbers(value);
        }
      }
      return formattedData;
    }

    return data;
  }

  private shouldSkipFormatting(key: string, value: any): boolean {
    // Skip field yang tidak boleh diformat
    const skipFields = [
      'id', 'createdAt', 'updatedAt', 'deletedAt', 'plan_date', 'date',
      'is_calender_day', 'is_holiday_day', 'is_available_day',
      'schedule_day', 'total_fleet'
    ];

    // Skip jika key ada dalam daftar skip
    if (skipFields.includes(key)) {
      return true;
    }

    // Skip jika value adalah Date object
    if (value instanceof Date) {
      return true;
    }

    // Skip jika value adalah boolean
    if (typeof value === 'boolean') {
      return true;
    }

    // Skip jika value adalah string yang bukan numeric
    if (typeof value === 'string') {
      const num = parseFloat(value);
      if (isNaN(num)) {
        return true;
      }
    }

    return false;
  }
}

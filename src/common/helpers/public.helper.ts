import { Response } from 'express';
import { Readable } from 'stream';
import csv from 'csv-parser';
import { Buffer } from 'buffer';
import moment from 'moment';

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

export const ACCEPTED_DATE_FORMATS: string[] = [
  'DD/MM/YYYY',
  'D/M/YYYY',
  'YYYY-MM-DD',
  'MM-DD-YYYY',
  'YYYY/MM/DD',
  'D/M/YYYY HH:mm',
  'DD/MM/YYYY HH:mm',
  'YYYY-MM-DD HH:mm',
  'YYYY/MM/DD HH:mm',
];

export function paginateResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Retrieve data success',
  statusCode = 200,
) {
  const pagination: Pagination = {
    total,
    page,
    limit,
    lastPage: Math.ceil(total / limit),
  };

  return {
    statusCode,
    message,
    data,
    pagination,
  };
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // ganti spasi & underscore dengan -
    .replace(/[^\w-]+/g, '') // hapus karakter selain huruf/angka/-
    .replace(/--+/g, '-'); // hilangkan double --
}

export function getResetCountdown(expire: string) {
  const expireDate = new Date(expire);
  const now = new Date();

  const diffMs = expireDate.getTime() - now.getTime();

  if (diffMs <= 0) return 'Expired';

  const minutes = Math.floor(diffMs / 1000 / 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  return `${minutes}m ${seconds}s remaining`;
}

export function generateSimpleNIP(id: number): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(100 + Math.random() * 900);
  return `${year}${rand}${id.toString().padStart(3, '0')}`;
}
export function generateNIPWithInitial(name: string, id: number): string {
  const year = new Date().getFullYear();

  const initials = name
    .split(' ')
    .map((n) => n[0]?.toUpperCase())
    .join('')
    .substring(0, 3);

  const paddedId = id.toString().padStart(4, '0');

  const randSymbols = ['-'];
  const symbol = randSymbols[Math.floor(Math.random() * randSymbols.length)];

  return `${initials}${symbol}${paddedId}`;
}

export function calculateTimeRange(time: Date, timeZone: string = 'Asia/Jakarta'): string {
  // Ambil jam di zona waktu tertentu
  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false,
    timeZone,
  });

  const hours = parseInt(formatter.format(time), 10);
  const nextHour = (hours + 1) % 24;

  const currentHour = hours.toString().padStart(2, '0');
  const nextHourStr = nextHour.toString().padStart(2, '0');

  return `${currentHour}-${nextHourStr}`;
}

export class CsvHelper {
  static async parseCsvFile(buffer: Buffer): Promise<any[]> {
    const rows: any[] = [];
    return new Promise((resolve, reject) => {
      Readable.from(buffer)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', () => resolve(rows))
        .on('error', (err) => reject(err));
    });
  }

  static generateErrorCsv(errorRows: any[]): Buffer {
    if (errorRows.length === 0) {
      return Buffer.from('No errors found', 'utf-8');
    }

    const headers = Object.keys(errorRows[0]);
    const csvContent = [
      headers.join(','), // header line
      ...errorRows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')),
    ].join('\n');

    return Buffer.from(csvContent, 'utf-8');
  }
}
export class PublicHelper {
  /**
   * Generate CSV stream dari baris error
   */
  static generateErrorCsvStream(errorRows: any[]): Readable {
    const headers = ['row', 'error', 'data'];
    const csvLines: string[] = [];

    // Header
    csvLines.push(headers.join(','));

    // Isi
    errorRows.forEach((err) => {
      const row = [
        err.row ?? '',
        `"${(err.message ?? '').replace(/"/g, '""')}"`,
        `"${JSON.stringify(err.data ?? {}).replace(/"/g, '""')}"`,
      ];
      csvLines.push(row.join(','));
    });

    // Gabungkan jadi satu string
    const csvContent = csvLines.join('\n');

    // Jadikan stream biar bisa langsung return
    const stream = new Readable();
    stream.push(csvContent);
    stream.push(null);

    return stream;
  }
}

export function normalizeString(value: string): string {
  return value?.toLowerCase().trim().replace(/\s+/g, ' '); // ubah spasi berlebih jadi 1 spasi
}

export function setCsvExportHeaders(res: Response, filename: string) {
  // Tentukan tipe file sebagai CSV
  res.setHeader('Content-Type', 'text/csv');

  // Set agar browser mendownload file, bukan ditampilkan inline
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Nonaktifkan caching untuk memastikan data selalu terbaru
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Security: cegah browser men-"sniff" MIME type
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && !!dateString.match(/^\d{4}-\d{2}-\d{2}$/);
}

export function isValidDateTime(dateTimeStr: string): boolean {
  // format: yyyy-mm-dd HH:mm
  const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
  if (!regex.test(dateTimeStr)) return false;

  const date = new Date(dateTimeStr.replace(' ', 'T'));
  return !isNaN(date.getTime());
}

export function convertStringDateYYYYMMDD(input: string) {
  const date = moment(input).format('YYYY-MM-DD');
  return date;
}

export function combineDateTime(date: string, time: string): string {
  const dateFormat = convertStringDateYYYYMMDD(date);
  return moment(`${dateFormat} ${time}`, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss.SSS');
}

export function combineShiftDateTime(date: string, startTime: string, endTime: string) {
  const dateFormat = convertStringDateYYYYMMDD(date);
  const start = moment(`${dateFormat} ${startTime.replace('.', ':')}`, 'YYYY-MM-DD HH:mm');
  let end = moment(`${dateFormat} ${endTime.replace('.', ':')}`, 'YYYY-MM-DD HH:mm');

  if (end.isSameOrBefore(start)) {
    end = end.add(1, 'day');
  }

  return {
    start: start.format('YYYY-MM-DD HH:mm:ss.SSS'),
    end: end.format('YYYY-MM-DD HH:mm:ss.SSS'),
  };
}

export function extractTime(datetime: string | Date, withSeconds = true): string {
  const format = withSeconds ? 'HH:mm:ss' : 'HH:mm';
  return moment(datetime).format(format);
}

/**
 * Parse date dengan beberapa format yang diperbolehkan
 * @param value - string date dari file
 * @param returnFormat - jika diisi, hasil akan diformat ke string dengan format ini
 * @param formats - list format yang diijinkan
 * @returns string (jika returnFormat diset) atau null jika invalid
 */
export function parseDateFile(
  value: string,
  returnFormat: string = 'YYYY-MM-DD',
  formats: string[] = ACCEPTED_DATE_FORMATS,
): string | null {
  if (!value) return null;

  const parsed = moment(value, formats, true);
  if (!parsed.isValid()) return null;

  return parsed.format(returnFormat);
}

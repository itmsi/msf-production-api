import { HttpException, HttpStatus } from '@nestjs/common';
export interface ApiResponse<T = any> {
  // meta(meta: any): any;
  statusCode: number;
  message: string;
  data?: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export function successResponse<T = any>(data: T, message = 'Retrieve data success', statusCode = 200): ApiResponse<T> {
  return {
    statusCode,
    message,
    data,
  };
}

export function successResponseWithMeta<T = any>(
  data: T,
  message = 'Retrieve data success',
  statusCode = 200,
  meta?: {
    total: number;
    page: number;
    limit: number;
  },
): ApiResponse<T> {
  return {
    statusCode,
    message,
    data,
    meta,
  };
}

export function emptyDataResponse<T = any>(message = 'Data not found', data: T = null as T): ApiResponse<T> {
  return {
    statusCode: 200,
    message,
    data,
  };
}

export function errorResponse(message = 'Error', statusCode = 400, error = true, extra?: Record<string, any>) {
  return {
    statusCode,
    message,
    error,
    ...(extra || {}),
    timestamp: new Date().toISOString(),
  };
}

export const throwError = (message: string | object = 'Bad Request', statusCode: HttpStatus = HttpStatus.BAD_REQUEST): never => {
  throw new HttpException(typeof message === 'string' ? { message } : message, statusCode);
};

export const importResponse = (
  total: number,
  successCount: number,
  failedCount: number,
  errorFileInfo: {
    error_file: { download_url: string; file_name: string } | null;
  },
) => {
  return successResponse(
    {
      total,
      success: successCount,
      failed: failedCount,
      error_file: errorFileInfo.error_file,
      hasErrorFile: failedCount > 0,
    },
    failedCount > 0
      ? `Import selesai dengan ${failedCount} error. ${
          errorFileInfo.error_file ? 'Download error CSV untuk detail.' : 'Gagal generate error file.'
        }`
      : 'Semua data valid',
  );
};

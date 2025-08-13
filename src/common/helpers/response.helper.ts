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

export function successResponse<T = any>(
  data: T,
  message = 'Retrieve data success',
  statusCode = 200,
): ApiResponse<T> {
  return {
    statusCode,
    message,
    data,
  };
}

export function errorResponse(
  message = 'Error',
  statusCode = 400,
  error = true,
  extra?: Record<string, any>,
) {
  return {
    statusCode,
    message,
    error,
    ...(extra || {}),
    timestamp: new Date().toISOString(),
  };
}

export const throwError = (
  message: string | object = 'Bad Request',
  statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
): never => {
  throw new HttpException(
    typeof message === 'string' ? { message } : message,
    statusCode,
  );
};

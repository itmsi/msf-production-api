/**
 * Helper functions untuk validasi manual
 * Bisa digunakan di service atau controller untuk validasi tambahan
 */

import { BadRequestException } from '@nestjs/common';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validasi string tidak boleh kosong (tidak hanya whitespace)
 */
export function validateNotEmptyString(value: any, fieldName: string): ValidationResult {
  if (value === null || value === undefined) {
    return {
      isValid: false,
      errors: [`${fieldName} tidak boleh kosong`],
    };
  }

  if (typeof value !== 'string') {
    return {
      isValid: false,
      errors: [`${fieldName} harus berupa string`],
    };
  }

  if (value.trim().length === 0) {
    return {
      isValid: false,
      errors: [`${fieldName} tidak boleh kosong atau hanya berisi whitespace`],
    };
  }

  return {
    isValid: true,
    errors: [],
  };
}

/**
 * Validasi array tidak boleh kosong
 */
export function validateNotEmptyArray(value: any, fieldName: string): ValidationResult {
  if (value === null || value === undefined) {
    return {
      isValid: false,
      errors: [`${fieldName} tidak boleh kosong`],
    };
  }

  if (!Array.isArray(value)) {
    return {
      isValid: false,
      errors: [`${fieldName} harus berupa array`],
    };
  }

  if (value.length === 0) {
    return {
      isValid: false,
      errors: [`${fieldName} tidak boleh kosong`],
    };
  }

  return {
    isValid: true,
    errors: [],
  };
}

/**
 * Validasi koordinat longitude (-180 sampai 180)
 */
export function validateLongitude(value: any, fieldName: string): ValidationResult {
  if (value === null || value === undefined) {
    return {
      isValid: false,
      errors: [`${fieldName} tidak boleh kosong`],
    };
  }

  if (typeof value !== 'number' || isNaN(value)) {
    return {
      isValid: false,
      errors: [`${fieldName} harus berupa angka float yang valid`],
    };
  }

  if (!isFinite(value)) {
    return {
      isValid: false,
      errors: [`${fieldName} harus berupa angka finite yang valid`],
    };
  }

  if (value < -180 || value > 180) {
    return {
      isValid: false,
      errors: [`${fieldName} harus berada di range -180 sampai 180`],
    };
  }

  return {
    isValid: true,
    errors: [],
  };
}

/**
 * Validasi koordinat latitude (-90 sampai 90)
 */
export function validateLatitude(value: any, fieldName: string): ValidationResult {
  if (value === null || value === undefined) {
    return {
      isValid: false,
      errors: [`${fieldName} tidak boleh kosong`],
    };
  }

  if (typeof value !== 'number' || isNaN(value)) {
    return {
      isValid: false,
      errors: [`${fieldName} harus berupa angka float yang valid`],
    };
  }

  if (!isFinite(value)) {
    return {
      isValid: false,
      errors: [`${fieldName} harus berupa angka finite yang valid`],
    };
  }

  if (value < -90 || value > 90) {
    return {
      isValid: false,
      errors: [`${fieldName} harus berada di range -90 sampai 90`],
    };
  }

  return {
    isValid: true,
    errors: [],
  };
}

/**
 * Validasi enum value
 */
export function validateEnum(value: any, allowedValues: any[], fieldName: string): ValidationResult {
  if (value === null || value === undefined) {
    return {
      isValid: false,
      errors: [`${fieldName} tidak boleh kosong`],
    };
  }

  if (!allowedValues.includes(value)) {
    return {
      isValid: false,
      errors: [`${fieldName} harus salah satu dari: ${allowedValues.join(', ')}`],
    };
  }

  return {
    isValid: true,
    errors: [],
  };
}

/**
 * Validasi multiple fields dan return semua error
 */
export function validateMultipleFields(validations: ValidationResult[]): ValidationResult {
  const allErrors: string[] = [];

  validations.forEach((validation) => {
    if (!validation.isValid) {
      allErrors.push(...validation.errors);
    }
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Validasi object dengan rules yang diberikan
 */
export function validateObject(obj: any, rules: Record<string, (value: any) => ValidationResult>): ValidationResult {
  const allErrors: string[] = [];

  for (const [fieldName, validator] of Object.entries(rules)) {
    const value = obj[fieldName];
    const validation = validator(value);

    if (!validation.isValid) {
      allErrors.push(...validation.errors);
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Validasi koordinat longitude yang nullable (-180 sampai 180)
 */
export function validateNullableLongitude(value: any, fieldName: string): ValidationResult {
  // Jika null/undefined, valid (nullable)
  if (value === null || value === undefined) {
    return {
      isValid: true,
      errors: [],
    };
  }

  if (typeof value !== 'number' || isNaN(value)) {
    return {
      isValid: false,
      errors: [`${fieldName} harus berupa angka float yang valid atau null`],
    };
  }

  if (!isFinite(value)) {
    return {
      isValid: false,
      errors: [`${fieldName} harus berupa angka finite yang valid atau null`],
    };
  }

  if (value < -180 || value > 180) {
    return {
      isValid: false,
      errors: [`${fieldName} harus berada di range -180 sampai 180 atau null`],
    };
  }

  return {
    isValid: true,
    errors: [],
  };
}

/**
 * Validasi koordinat latitude yang nullable (-90 sampai 90)
 */
export function validateNullableLatitude(value: any, fieldName: string): ValidationResult {
  // Jika null/undefined, valid (nullable)
  if (value === null || value === undefined) {
    return {
      isValid: true,
      errors: [],
    };
  }

  if (typeof value !== 'number' || isNaN(value)) {
    return {
      isValid: false,
      errors: [`${fieldName} harus berupa angka float yang valid atau null`],
    };
  }

  if (!isFinite(value)) {
    return {
      isValid: false,
      errors: [`${fieldName} harus berupa angka finite yang valid atau null`],
    };
  }

  if (value < -90 || value > 90) {
    return {
      isValid: false,
      errors: [`${fieldName} harus berada di range -90 sampai 90 atau null`],
    };
  }

  return {
    isValid: true,
    errors: [],
  };
}

export const validateImportFile = (file: Express.Multer.File): void => {
  if (!file) {
    throw new BadRequestException('File tidak ditemukan');
  }
  if (!file.mimetype.includes('csv') && !file.originalname.endsWith('.csv')) {
    throw new BadRequestException('File harus berupa CSV');
  }
};

export const validateFileNumber = (
  row: Record<string, any>, // tambahin row sebagai parameter
  field: string,
  label: string,
  max?: number,
): { ok: boolean; error?: string } => {
  const value = row[field];

  if (value === undefined || value === null || value === '') {
    return { ok: false, error: `${label} is required` };
  }

  const num = Number(value);

  if (isNaN(num)) {
    return {
      ok: false,
      error: `${label} harus berupa angka (row value: "${value}")`,
    };
  }

  if (num < 1) {
    return {
      ok: false,
      error: `${label} tidak boleh kurang dari 1 (row value: "${value}")`,
    };
  }

  if (max !== undefined && num > max) {
    return {
      ok: false,
      error: `${label} tidak boleh lebih dari ${max} (row value: "${value}")`,
    };
  }

  return { ok: true };
};

import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validator untuk memastikan value adalah float/number yang valid
 * Tidak boleh null, undefined, atau NaN
 */
export function IsValidFloat(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidFloat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Cek apakah value ada dan bukan null/undefined
          if (value === null || value === undefined) {
            return false;
          }

          // Cek apakah value adalah number
          if (typeof value !== 'number') {
            return false;
          }

          // Cek apakah bukan NaN
          if (isNaN(value)) {
            return false;
          }

          // Cek apakah finite number (bukan Infinity atau -Infinity)
          if (!isFinite(value)) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} harus berupa angka float yang valid`;
        },
      },
    });
  };
}

/**
 * Custom validator untuk memastikan value adalah float dengan range tertentu
 */
export function IsFloatInRange(
  min: number,
  max: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFloatInRange',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Cek apakah value ada dan bukan null/undefined
          if (value === null || value === undefined) {
            return false;
          }

          // Cek apakah value adalah number
          if (typeof value !== 'number') {
            return false;
          }

          // Cek apakah bukan NaN
          if (isNaN(value)) {
            return false;
          }

          // Cek apakah finite number
          if (!isFinite(value)) {
            return false;
          }

          // Cek range
          return value >= min && value <= max;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} harus berupa angka float antara ${min} sampai ${max}`;
        },
      },
    });
  };
}

/**
 * Custom validator untuk memastikan value adalah float yang nullable (optional)
 */
export function IsNullableFloat(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNullableFloat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Jika null/undefined, valid (nullable)
          if (value === null || value === undefined) {
            return true;
          }

          // Jika ada value, harus valid float
          if (typeof value !== 'number') {
            return false;
          }

          if (isNaN(value)) {
            return false;
          }

          if (!isFinite(value)) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} harus berupa angka float yang valid atau null`;
        },
      },
    });
  };
}

/**
 * Custom validator untuk memastikan value adalah float yang nullable dengan range tertentu
 */
export function IsNullableFloatInRange(
  min: number,
  max: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNullableFloatInRange',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Jika null/undefined, valid (nullable)
          if (value === null || value === undefined) {
            return true;
          }

          // Jika ada value, harus valid float dalam range
          if (typeof value !== 'number') {
            return false;
          }

          if (isNaN(value)) {
            return false;
          }

          if (!isFinite(value)) {
            return false;
          }

          return value >= min && value <= max;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} harus berupa angka float antara ${min} sampai ${max} atau null`;
        },
      },
    });
  };
}

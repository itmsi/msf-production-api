import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validator untuk memastikan string tidak kosong (tidak hanya whitespace)
 * Berbeda dengan @IsNotEmpty() yang hanya mengecek null/undefined
 */
export function IsNotEmptyString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotEmptyString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Cek apakah value ada dan bukan null/undefined
          if (value === null || value === undefined) {
            return false;
          }

          // Cek apakah value adalah string
          if (typeof value !== 'string') {
            return false;
          }

          // Cek apakah string tidak kosong setelah trim whitespace
          return value.trim().length > 0;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} tidak boleh kosong atau hanya berisi whitespace`;
        },
      },
    });
  };
}

/**
 * Custom validator untuk memastikan array tidak kosong dan setiap item string tidak kosong
 */
export function IsNotEmptyStringArray(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotEmptyStringArray',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Cek apakah value ada dan bukan null/undefined
          if (value === null || value === undefined) {
            return false;
          }

          // Cek apakah value adalah array
          if (!Array.isArray(value)) {
            return false;
          }

          // Cek apakah array tidak kosong
          if (value.length === 0) {
            return false;
          }

          // Cek apakah setiap item adalah string yang tidak kosong
          return value.every(
            (item) => typeof item === 'string' && item.trim().length > 0,
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} harus berupa array yang tidak kosong dan setiap item tidak boleh kosong`;
        },
      },
    });
  };
}

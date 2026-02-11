import { Column, ColumnOptions } from 'typeorm';
import { registerDecorator, ValidationOptions } from 'class-validator';

export function DecimalColumn(
  options: {
    precision?: number;
    scale?: number;
    nullable?: boolean;
    default?: number;
  } = {},
): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const columnOptions: ColumnOptions = {
      type: 'decimal',
      precision: options.precision || 15,
      scale: options.scale || 2,
      nullable: options.nullable || false,
      default: options.default,
      transformer: {
        to: (value: number) => value,
        from: (value: string) => parseFloat(value || '0'),
      },
    };

    Column(columnOptions)(target, propertyKey);
  };
}

export function IsDecimal(
  validationOptions?: ValidationOptions & {
    min?: number;
    max?: number;
    precision?: number;
    scale?: number;
  },
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDecimal',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (value === null || value === undefined) {
            return true; // Let @IsOptional handle null/undefined
          }
          
          const num = parseFloat(value);
          if (isNaN(num)) {
            return false;
          }

          if (validationOptions?.min !== undefined && num < validationOptions.min) {
            return false;
          }

          if (validationOptions?.max !== undefined && num > validationOptions.max) {
            return false;
          }

          // Check precision and scale
          if (validationOptions?.precision || validationOptions?.scale) {
            const [integerPart, decimalPart] = value.toString().split('.');
            const precision = integerPart.length + (decimalPart?.length || 0);
            const scale = decimalPart?.length || 0;

            if (validationOptions.precision && precision > validationOptions.precision) {
              return false;
            }

            if (validationOptions.scale && scale > validationOptions.scale) {
              return false;
            }
          }

          return true;
        },
        defaultMessage() {
          let message = 'Must be a valid decimal number';
          
          if (validationOptions?.min !== undefined) {
            message += ` greater than or equal to ${validationOptions.min}`;
          }
          
          if (validationOptions?.max !== undefined) {
            message += ` less than or equal to ${validationOptions.max}`;
          }
          
          if (validationOptions?.precision) {
            message += ` with precision ${validationOptions.precision}`;
          }
          
          if (validationOptions?.scale) {
            message += ` and scale ${validationOptions.scale}`;
          }
          
          return message;
        },
      },
    });
  };
}
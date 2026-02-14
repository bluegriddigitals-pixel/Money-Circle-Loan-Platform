"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecimalColumn = DecimalColumn;
exports.IsDecimal = IsDecimal;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
function DecimalColumn(options = {}) {
    return (target, propertyKey) => {
        const columnOptions = {
            type: 'decimal',
            precision: options.precision || 15,
            scale: options.scale || 2,
            nullable: options.nullable || false,
            default: options.default,
            transformer: {
                to: (value) => value,
                from: (value) => parseFloat(value || '0'),
            },
        };
        (0, typeorm_1.Column)(columnOptions)(target, propertyKey);
    };
}
function IsDecimal(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isDecimal',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value) {
                    if (value === null || value === undefined) {
                        return true;
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
//# sourceMappingURL=decimal-column.decorator.js.map
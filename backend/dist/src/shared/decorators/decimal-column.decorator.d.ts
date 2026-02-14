import { ValidationOptions } from 'class-validator';
export declare function DecimalColumn(options?: {
    precision?: number;
    scale?: number;
    nullable?: boolean;
    default?: number;
}): PropertyDecorator;
export declare function IsDecimal(validationOptions?: ValidationOptions & {
    min?: number;
    max?: number;
    precision?: number;
    scale?: number;
}): (object: object, propertyName: string) => void;

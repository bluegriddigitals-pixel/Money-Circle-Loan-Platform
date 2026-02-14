import { Type } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger';
export interface PaginatedResponseDto<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}
export declare const ApiPaginatedResponse: <TModel extends Type<any>>(model: TModel, description?: string) => <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export declare const ApiSingleResponse: <TModel extends Type<any>>(model: TModel, description?: string) => <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export declare const ApiCreatedResponseWithData: <TModel extends Type<any>>(model: TModel, description?: string) => <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export declare const ApiErrorResponse: (statusCode: number, message: string, error?: string) => ApiResponseOptions;

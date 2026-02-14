import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiCreatedResponse, ApiResponseOptions, getSchemaPath } from '@nestjs/swagger';

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

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
  description?: string,
) => {
  return applyDecorators(
    ApiOkResponse({
      description: description || 'Paginated list of items',
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              meta: {
                type: 'object',
                properties: {
                  total: { type: 'number', example: 100 },
                  page: { type: 'number', example: 1 },
                  limit: { type: 'number', example: 10 },
                  totalPages: { type: 'number', example: 10 },
                  hasNext: { type: 'boolean', example: true },
                  hasPrevious: { type: 'boolean', example: false },
                },
              },
            },
          },
        ],
      },
    }),
  );
};

export const ApiSingleResponse = <TModel extends Type<any>>(
  model: TModel,
  description?: string,
) => {
  return applyDecorators(
    ApiOkResponse({
      description: description || 'Single item',
      schema: {
        allOf: [
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
              message: { type: 'string', example: 'Operation successful' },
              timestamp: { type: 'string', example: new Date().toISOString() },
            },
          },
        ],
      },
    }),
  );
};

export const ApiCreatedResponseWithData = <TModel extends Type<any>>(
  model: TModel,
  description?: string,
) => {
  return applyDecorators(
    ApiCreatedResponse({
      description: description || 'Item created successfully',
      schema: {
        allOf: [
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
              message: { type: 'string', example: 'Created successfully' },
              timestamp: { type: 'string', example: new Date().toISOString() },
            },
          },
        ],
      },
    }),
  );
};

export const ApiErrorResponse = (
  statusCode: number,
  message: string,
  error?: string,
): ApiResponseOptions => {
  return {
    status: statusCode,
    description: message,
    schema: {
      properties: {
        statusCode: { type: 'number', example: statusCode },
        message: { type: 'string', example: message },
        error: { type: 'string', example: error || message },
        timestamp: { type: 'string', example: new Date().toISOString() },
        path: { type: 'string', example: '/api/v1/resource' },
      },
    },
  };
};
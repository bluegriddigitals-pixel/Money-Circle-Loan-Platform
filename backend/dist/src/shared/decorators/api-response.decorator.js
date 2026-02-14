"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiErrorResponse = exports.ApiCreatedResponseWithData = exports.ApiSingleResponse = exports.ApiPaginatedResponse = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ApiPaginatedResponse = (model, description) => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOkResponse)({
        description: description || 'Paginated list of items',
        schema: {
            allOf: [
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: { $ref: (0, swagger_1.getSchemaPath)(model) },
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
    }));
};
exports.ApiPaginatedResponse = ApiPaginatedResponse;
const ApiSingleResponse = (model, description) => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOkResponse)({
        description: description || 'Single item',
        schema: {
            allOf: [
                {
                    properties: {
                        data: { $ref: (0, swagger_1.getSchemaPath)(model) },
                        message: { type: 'string', example: 'Operation successful' },
                        timestamp: { type: 'string', example: new Date().toISOString() },
                    },
                },
            ],
        },
    }));
};
exports.ApiSingleResponse = ApiSingleResponse;
const ApiCreatedResponseWithData = (model, description) => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiCreatedResponse)({
        description: description || 'Item created successfully',
        schema: {
            allOf: [
                {
                    properties: {
                        data: { $ref: (0, swagger_1.getSchemaPath)(model) },
                        message: { type: 'string', example: 'Created successfully' },
                        timestamp: { type: 'string', example: new Date().toISOString() },
                    },
                },
            ],
        },
    }));
};
exports.ApiCreatedResponseWithData = ApiCreatedResponseWithData;
const ApiErrorResponse = (statusCode, message, error) => {
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
exports.ApiErrorResponse = ApiErrorResponse;
//# sourceMappingURL=api-response.decorator.js.map
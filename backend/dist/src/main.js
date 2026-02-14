"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const http_exception_filter_1 = require("./shared/filters/http-exception.filter");
const transform_interceptor_1 = require("./shared/interceptors/transform.interceptor");
const logging_interceptor_1 = require("./shared/interceptors/logging.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
        bufferLogs: true,
    });
    const configService = app.get(config_1.ConfigService);
    app.setGlobalPrefix('api/v1');
    app.enableCors({
        origin: configService.get('CORS_ORIGINS', 'http://localhost:3000').split(','),
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['X-Total-Count', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
        credentials: true,
        maxAge: 86400,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    if (configService.get('NODE_ENV') !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Money Circle Loan Platform API')
            .setDescription('Secure Peer-to-Peer Lending Platform API Documentation')
            .setVersion('1.0.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        })
            .addTag('auth', 'Authentication & Authorization')
            .addTag('users', 'User Management')
            .addTag('loans', 'Loan Operations')
            .addTag('payments', 'Payment Processing')
            .addTag('marketplace', 'Investment Marketplace')
            .addTag('risk', 'Risk Assessment')
            .addTag('admin', 'System Administration')
            .addTag('compliance', 'KYC/AML Compliance')
            .addServer('http://localhost:3000', 'Development Server')
            .addServer('https://api.moneycircle.example.com', 'Production Server')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                docExpansion: 'none',
                filter: true,
                showRequestDuration: true,
            },
        });
    }
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
    });
    const port = configService.get('PORT', 3000);
    const host = configService.get('HOST', '0.0.0.0');
    await app.listen(port, host);
    console.log(`🚀 Application is running on: http://${host}:${port}`);
    console.log(`📚 Swagger Documentation: http://${host}:${port}/api/docs`);
    console.log(`📊 Health Check: http://${host}:${port}/api/v1/health`);
    console.log(`🌐 Environment: ${configService.get('NODE_ENV', 'development')}`);
}
bootstrap().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
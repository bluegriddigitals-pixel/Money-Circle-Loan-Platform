"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ThrottleGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkipThrottle = exports.THROTTLE_SKIP_KEY = exports.Throttle = exports.ThrottleGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const roles_decorator_1 = require("../decorators/roles.decorator");
let ThrottleGuard = ThrottleGuard_1 = class ThrottleGuard {
    constructor(reflector, configService) {
        this.reflector = reflector;
        this.configService = configService;
        this.requestCounts = new Map();
        this.logger = new common_1.Logger(ThrottleGuard_1.name);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const rateLimitOptions = this.reflector.getAllAndOverride(roles_decorator_1.RATE_LIMIT_KEY, [context.getHandler(), context.getClass()]);
        const ttl = rateLimitOptions?.ttl || 60;
        const limit = rateLimitOptions?.limit || 100;
        const key = this.generateKey(request);
        try {
            const result = this.checkRateLimit(key, ttl, limit, response);
            this.setRateLimitHeaders(response, {
                limit,
                remaining: result.remaining,
                reset: Math.ceil(Date.now() / 1000 + ttl),
            });
            request.rateLimit = {
                limit,
                remaining: result.remaining,
                reset: Math.ceil(Date.now() / 1000 + ttl),
            };
            return true;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('Rate limiting error:', error);
            return true;
        }
    }
    checkRateLimit(key, ttl, limit, response) {
        const now = Date.now();
        const record = this.requestCounts.get(key);
        if (!record || now > record.resetTime) {
            this.requestCounts.set(key, {
                count: 1,
                resetTime: now + (ttl * 1000),
            });
            return { remaining: limit - 1 };
        }
        if (record.count >= limit) {
            const retryAfter = Math.ceil((record.resetTime - now) / 1000);
            this.setRateLimitHeaders(response, {
                limit,
                remaining: 0,
                reset: Math.ceil(record.resetTime / 1000),
                retryAfter,
            });
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
                message: 'Too Many Requests',
                error: 'Rate limit exceeded',
                retryAfter,
                timestamp: new Date().toISOString(),
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        record.count++;
        this.requestCounts.set(key, record);
        return { remaining: limit - record.count };
    }
    generateKey(request) {
        const ip = request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            request.headers['x-real-ip'] ||
            request.connection?.remoteAddress ||
            request.socket?.remoteAddress ||
            request.ip ||
            'unknown';
        const userId = request.user?.id || 'anonymous';
        const route = request.route?.path || request.url;
        return `${userId}:${ip}:${route}`;
    }
    setRateLimitHeaders(response, { limit, remaining, reset, retryAfter }) {
        response.header('X-RateLimit-Limit', limit);
        response.header('X-RateLimit-Remaining', remaining);
        response.header('X-RateLimit-Reset', reset);
        if (retryAfter) {
            response.header('Retry-After', retryAfter);
        }
    }
};
exports.ThrottleGuard = ThrottleGuard;
exports.ThrottleGuard = ThrottleGuard = ThrottleGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        config_1.ConfigService])
], ThrottleGuard);
const Throttle = (options) => {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata(roles_decorator_1.RATE_LIMIT_KEY, options, descriptor.value);
        return descriptor;
    };
};
exports.Throttle = Throttle;
exports.THROTTLE_SKIP_KEY = 'throttle:skip';
const SkipThrottle = () => {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata(exports.THROTTLE_SKIP_KEY, true, descriptor.value);
        return descriptor;
    };
};
exports.SkipThrottle = SkipThrottle;
//# sourceMappingURL=throttle.guard.js.map
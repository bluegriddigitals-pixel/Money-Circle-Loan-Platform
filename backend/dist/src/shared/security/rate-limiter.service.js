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
var RateLimiterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiterService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let RateLimiterService = RateLimiterService_1 = class RateLimiterService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RateLimiterService_1.name);
        this.store = new Map();
    }
    async checkLimit(key, limit, windowSeconds) {
        const now = new Date();
        const entry = this.store.get(key);
        if (!entry) {
            this.store.set(key, {
                attempts: 1,
                resetTime: new Date(now.getTime() + windowSeconds * 1000),
            });
            return;
        }
        if (entry.resetTime < now) {
            this.store.set(key, {
                attempts: 1,
                resetTime: new Date(now.getTime() + windowSeconds * 1000),
            });
            return;
        }
        if (entry.attempts >= limit) {
            throw new Error('Rate limit exceeded');
        }
        entry.attempts += 1;
        this.store.set(key, entry);
    }
    async clearKey(key) {
        this.store.delete(key);
    }
};
exports.RateLimiterService = RateLimiterService;
exports.RateLimiterService = RateLimiterService = RateLimiterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RateLimiterService);
//# sourceMappingURL=rate-limiter.service.js.map
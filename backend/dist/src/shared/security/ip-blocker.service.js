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
var IpBlockerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpBlockerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let IpBlockerService = IpBlockerService_1 = class IpBlockerService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(IpBlockerService_1.name);
        this.blockedIps = new Map();
    }
    async checkIp(ip) {
        const blocked = this.blockedIps.get(ip);
        if (blocked && blocked.blockedUntil > new Date()) {
            throw new Error(`IP ${ip} is blocked until ${blocked.blockedUntil}`);
        }
        if (blocked && blocked.blockedUntil <= new Date()) {
            this.blockedIps.delete(ip);
        }
    }
    async blockIp(ip, reason, durationMinutes = 60) {
        const blockedUntil = new Date();
        blockedUntil.setMinutes(blockedUntil.getMinutes() + durationMinutes);
        this.blockedIps.set(ip, {
            blockedUntil,
            reason,
        });
        this.logger.warn(`IP ${ip} blocked until ${blockedUntil}. Reason: ${reason}`);
    }
    async unblockIp(ip) {
        this.blockedIps.delete(ip);
        this.logger.log(`IP ${ip} unblocked`);
    }
    async isUnusualLocation(userId, ip) {
        return false;
    }
};
exports.IpBlockerService = IpBlockerService;
exports.IpBlockerService = IpBlockerService = IpBlockerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], IpBlockerService);
//# sourceMappingURL=ip-blocker.service.js.map
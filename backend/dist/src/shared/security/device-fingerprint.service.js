"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DeviceFingerprintService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceFingerprintService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
let DeviceFingerprintService = DeviceFingerprintService_1 = class DeviceFingerprintService {
    constructor() {
        this.logger = new common_1.Logger(DeviceFingerprintService_1.name);
        this.userDevices = new Map();
    }
    async generateFingerprint(request) {
        const userAgent = request.headers['user-agent'] || '';
        const acceptLanguage = request.headers['accept-language'] || '';
        const acceptEncoding = request.headers['accept-encoding'] || '';
        const ip = request.ip || request.connection.remoteAddress || '';
        const fingerprintData = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${ip}`;
        return crypto
            .createHash('sha256')
            .update(fingerprintData)
            .digest('hex');
    }
    async isNewDevice(userId, fingerprint) {
        if (!this.userDevices.has(userId)) {
            this.userDevices.set(userId, new Set());
            return true;
        }
        const devices = this.userDevices.get(userId);
        const isNew = !devices.has(fingerprint);
        if (isNew) {
            devices.add(fingerprint);
        }
        return isNew;
    }
    async registerDevice(userId, fingerprint) {
        if (!this.userDevices.has(userId)) {
            this.userDevices.set(userId, new Set());
        }
        this.userDevices.get(userId).add(fingerprint);
    }
    async removeDevice(userId, fingerprint) {
        if (this.userDevices.has(userId)) {
            this.userDevices.get(userId).delete(fingerprint);
        }
    }
};
exports.DeviceFingerprintService = DeviceFingerprintService;
exports.DeviceFingerprintService = DeviceFingerprintService = DeviceFingerprintService_1 = __decorate([
    (0, common_1.Injectable)()
], DeviceFingerprintService);
//# sourceMappingURL=device-fingerprint.service.js.map
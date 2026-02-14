"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
});
//# sourceMappingURL=jwt.config.js.map
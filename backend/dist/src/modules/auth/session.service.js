"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SessionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
let SessionService = SessionService_1 = class SessionService {
    constructor() {
        this.logger = new common_1.Logger(SessionService_1.name);
        this.sessions = new Map();
        this.userSessions = new Map();
    }
    async createSession(userId, ipAddress, userAgent, deviceFingerprint) {
        const sessionId = this.generateSessionId();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const session = {
            id: sessionId,
            userId,
            ipAddress,
            userAgent,
            deviceFingerprint,
            createdAt: now,
            lastActivityAt: now,
            expiresAt,
            isActive: true,
        };
        this.sessions.set(sessionId, session);
        if (!this.userSessions.has(userId)) {
            this.userSessions.set(userId, new Set());
        }
        this.userSessions.get(userId).add(sessionId);
        this.logger.log(`Session created for user: ${userId}, Session: ${sessionId}`);
        return session;
    }
    async getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return null;
        }
        if (session.expiresAt < new Date()) {
            await this.invalidateSession(sessionId);
            return null;
        }
        return session;
    }
    async invalidateSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.isActive = false;
            this.sessions.set(sessionId, session);
            const userSessions = this.userSessions.get(session.userId);
            if (userSessions) {
                userSessions.delete(sessionId);
                if (userSessions.size === 0) {
                    this.userSessions.delete(session.userId);
                }
            }
            this.logger.log(`Session invalidated: ${sessionId}`);
        }
    }
    async invalidateAllUserSessions(userId) {
        const userSessions = this.userSessions.get(userId);
        if (userSessions) {
            for (const sessionId of userSessions) {
                const session = this.sessions.get(sessionId);
                if (session) {
                    session.isActive = false;
                    this.sessions.set(sessionId, session);
                }
            }
            this.userSessions.delete(userId);
            this.logger.log(`All sessions invalidated for user: ${userId}`);
        }
    }
    async refreshSession(sessionId, ipAddress) {
        const session = await this.getSession(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }
        if (!session.isActive) {
            throw new Error('Session is inactive');
        }
        session.lastActivityAt = new Date();
        session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        session.ipAddress = ipAddress;
        this.sessions.set(sessionId, session);
        this.logger.log(`Session refreshed: ${sessionId}`);
        return session;
    }
    async getUserSessions(userId) {
        const userSessions = this.userSessions.get(userId) || new Set();
        const sessions = [];
        for (const sessionId of userSessions) {
            const session = await this.getSession(sessionId);
            if (session && session.isActive) {
                sessions.push(session);
            }
        }
        return sessions;
    }
    async cleanExpiredSessions() {
        let cleanedCount = 0;
        const now = new Date();
        for (const [sessionId, session] of this.sessions.entries()) {
            if (session.expiresAt < now) {
                await this.invalidateSession(sessionId);
                cleanedCount++;
            }
        }
        this.logger.log(`Cleaned ${cleanedCount} expired sessions`);
        return cleanedCount;
    }
    generateSessionId() {
        return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = SessionService_1 = __decorate([
    (0, common_1.Injectable)()
], SessionService);
//# sourceMappingURL=session.service.js.map
export interface Session {
    id: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    deviceFingerprint: string;
    createdAt: Date;
    lastActivityAt: Date;
    expiresAt: Date;
    isActive: boolean;
}
export declare class SessionService {
    private readonly logger;
    private readonly sessions;
    private readonly userSessions;
    createSession(userId: string, ipAddress: string, userAgent: string, deviceFingerprint: string): Promise<Session>;
    getSession(sessionId: string): Promise<Session | null>;
    invalidateSession(sessionId: string): Promise<void>;
    invalidateAllUserSessions(userId: string): Promise<void>;
    refreshSession(sessionId: string, ipAddress: string): Promise<Session>;
    getUserSessions(userId: string): Promise<Session[]>;
    cleanExpiredSessions(): Promise<number>;
    private generateSessionId;
}

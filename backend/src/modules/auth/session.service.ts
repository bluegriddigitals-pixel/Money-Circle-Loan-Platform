import { Injectable, Logger } from '@nestjs/common';

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

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  
  // In-memory store for development - replace with Redis in production
  private readonly sessions: Map<string, Session> = new Map();
  private readonly userSessions: Map<string, Set<string>> = new Map();

  /**
   * Create a new session
   */
  async createSession(
    userId: string,
    ipAddress: string,
    userAgent: string,
    deviceFingerprint: string,
  ): Promise<Session> {
    const sessionId = this.generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session: Session = {
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

    // Store session
    this.sessions.set(sessionId, session);

    // Add to user sessions
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId).add(sessionId);

    this.logger.log(`Session created for user: ${userId}, Session: ${sessionId}`);
    
    return session;
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<Session | null> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await this.invalidateSession(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Invalidate a session
   */
  async invalidateSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      session.isActive = false;
      this.sessions.set(sessionId, session);
      
      // Remove from user sessions
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

  /**
   * Invalidate all sessions for a user
   */
  async invalidateAllUserSessions(userId: string): Promise<void> {
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

  /**
   * Refresh a session
   */
  async refreshSession(sessionId: string, ipAddress: string): Promise<Session> {
    const session = await this.getSession(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.isActive) {
      throw new Error('Session is inactive');
    }

    // Update last activity and extend expiry
    session.lastActivityAt = new Date();
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    session.ipAddress = ipAddress; // Update IP address
    
    this.sessions.set(sessionId, session);
    
    this.logger.log(`Session refreshed: ${sessionId}`);
    
    return session;
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<Session[]> {
    const userSessions = this.userSessions.get(userId) || new Set();
    const sessions: Session[] = [];
    
    for (const sessionId of userSessions) {
      const session = await this.getSession(sessionId);
      if (session && session.isActive) {
        sessions.push(session);
      }
    }
    
    return sessions;
  }

  /**
   * Clean expired sessions
   */
  async cleanExpiredSessions(): Promise<number> {
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

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
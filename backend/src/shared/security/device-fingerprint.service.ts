import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class DeviceFingerprintService {
  private readonly logger = new Logger(DeviceFingerprintService.name);
  private readonly userDevices = new Map<string, Set<string>>();

  async generateFingerprint(request: Request): Promise<string> {
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

  async isNewDevice(userId: string, fingerprint: string): Promise<boolean> {
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

  async registerDevice(userId: string, fingerprint: string): Promise<void> {
    if (!this.userDevices.has(userId)) {
      this.userDevices.set(userId, new Set());
    }
    
    this.userDevices.get(userId).add(fingerprint);
  }

  async removeDevice(userId: string, fingerprint: string): Promise<void> {
    if (this.userDevices.has(userId)) {
      this.userDevices.get(userId).delete(fingerprint);
    }
  }
}
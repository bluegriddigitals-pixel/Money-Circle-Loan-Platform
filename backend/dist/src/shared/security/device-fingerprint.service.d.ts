import { Request } from 'express';
export declare class DeviceFingerprintService {
    private readonly logger;
    private readonly userDevices;
    generateFingerprint(request: Request): Promise<string>;
    isNewDevice(userId: string, fingerprint: string): Promise<boolean>;
    registerDevice(userId: string, fingerprint: string): Promise<void>;
    removeDevice(userId: string, fingerprint: string): Promise<void>;
}

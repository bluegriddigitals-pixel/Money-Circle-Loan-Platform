export declare class ResetPasswordRequestDto {
    email: string;
    clientInfo?: {
        ipAddress?: string;
        userAgent?: string;
        deviceFingerprint?: string;
    };
}

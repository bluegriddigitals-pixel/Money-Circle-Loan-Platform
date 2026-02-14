export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
    clientInfo?: {
        ipAddress?: string;
        userAgent?: string;
        deviceFingerprint?: string;
    };
}

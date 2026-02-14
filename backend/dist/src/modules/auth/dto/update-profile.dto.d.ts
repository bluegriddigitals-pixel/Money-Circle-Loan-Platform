declare class NotificationPreferencesDto {
    email?: Record<string, any>;
    sms?: Record<string, any>;
    push?: Record<string, any>;
    marketing?: Record<string, any>;
}
declare class PrivacySettingsDto {
    profileVisibility?: string;
    activityVisibility?: string;
    searchVisibility?: boolean;
}
declare class SecuritySettingsDto {
    twoFactorEnabled?: boolean;
    biometricEnabled?: boolean;
    sessionTimeout?: number;
    loginAlerts?: boolean;
    unusualActivityAlerts?: boolean;
}
declare class PreferencesDto {
    notification?: NotificationPreferencesDto;
    privacy?: PrivacySettingsDto;
    security?: SecuritySettingsDto;
}
export declare class UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    preferences?: PreferencesDto;
}
export {};

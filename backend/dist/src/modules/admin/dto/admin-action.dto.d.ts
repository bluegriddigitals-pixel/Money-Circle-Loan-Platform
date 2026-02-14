export declare enum AdminActionType {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete",
    VIEW = "view",
    EXPORT = "export",
    IMPORT = "import",
    LOGIN = "login",
    LOGOUT = "logout",
    CONFIG_CHANGE = "config_change",
    PERMISSION_CHANGE = "permission_change",
    USER_MANAGEMENT = "user_management",
    SYSTEM_MAINTENANCE = "system_maintenance"
}
export declare class AdminActionDto {
    action: AdminActionType;
    details: Record<string, any>;
    resourceType?: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
}

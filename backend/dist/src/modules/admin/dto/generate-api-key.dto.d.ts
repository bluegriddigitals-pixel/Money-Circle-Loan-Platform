export declare enum ApiKeyPermission {
    READ = "read",
    WRITE = "write",
    DELETE = "delete",
    ADMIN = "admin",
    REPORTS = "reports",
    PAYMENTS = "payments",
    USERS = "users",
    LOANS = "loans"
}
export declare class GenerateApiKeyDto {
    name: string;
    permissions: ApiKeyPermission[];
    expiresAt?: string;
    description?: string;
    allowedIps?: string[];
}

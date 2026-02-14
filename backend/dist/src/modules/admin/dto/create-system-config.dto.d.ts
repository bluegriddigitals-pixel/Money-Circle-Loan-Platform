export declare enum ConfigDataType {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    JSON = "json"
}
export declare class CreateSystemConfigDto {
    key: string;
    value: any;
    description?: string;
    dataType: ConfigDataType;
    category?: string;
    isPublic?: boolean;
}

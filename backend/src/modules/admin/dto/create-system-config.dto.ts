import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, ValidateIf } from 'class-validator';

export enum ConfigDataType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

export class CreateSystemConfigDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsNotEmpty()
  @ValidateIf(o => o.dataType === ConfigDataType.STRING, { message: 'Value must be a string' })
  @ValidateIf(o => o.dataType === ConfigDataType.NUMBER, { message: 'Value must be a number' })
  @ValidateIf(o => o.dataType === ConfigDataType.BOOLEAN, { message: 'Value must be a boolean' })
  @ValidateIf(o => o.dataType === ConfigDataType.JSON, { message: 'Value must be a valid JSON object' })
  value: any;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ConfigDataType)
  dataType: ConfigDataType;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  Matches,
  MinLength,
  MaxLength,
  IsPhoneNumber,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../../user/entities/user.entity";

export class RegisterDto {
  @ApiProperty({ example: "john.doe@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "Password123!" })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
  })
  password: string;

  @ApiProperty({ example: "John" })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: "Doe" })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: "+27821234567", required: false })
  @IsOptional()
  @IsPhoneNumber("ZA")
  phoneNumber?: string;

  @ApiProperty({ example: "1990-01-01", required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.BORROWER })
  @IsEnum(UserRole)
  role: UserRole;
}
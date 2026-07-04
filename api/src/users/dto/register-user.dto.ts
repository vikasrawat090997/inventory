import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ description: 'The unique username', example: 'pharmacist_amit' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Email address of the pharmacist', example: 'amit@rxkeep.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password (minimum 6 characters)', example: 'amit123' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ description: 'Name of the medical pharmacy store', example: 'Amit Medical Hall' })
  @IsString()
  @IsNotEmpty()
  pharmacyName: string;
}

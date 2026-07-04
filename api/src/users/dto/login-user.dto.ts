import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ description: 'The registered username', example: 'pharmacist_amit' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Password credentials', example: 'amit123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 60)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/^\+380\d{9}$/, { message: 'Phone must be in format +380XXXXXXXXX' })
  phone: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  position_id: number;
}

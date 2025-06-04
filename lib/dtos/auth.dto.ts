import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

// Password complexity: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
// Regex from: https://ihateregex.io/expr/password
const PASSWORD_REGEX =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username!: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message:
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  password!: string;

  @IsString()
  @IsNotEmpty()
  passwordConfirmation!: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username!: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message:
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  newPassword!: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message:
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  newPassword!: string;

  @IsString()
  @IsNotEmpty()
  confirmNewPassword!: string;
}
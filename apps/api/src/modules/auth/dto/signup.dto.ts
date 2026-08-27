import { IsEmail, IsString, Matches, Length, IsIn } from 'class-validator';
import { AGE_RANGES, GENDERS, CITIES } from './register.dto';

// Explicit, reasonable password policy — not an enterprise complexity
// requirement: minimum 8 characters, at least one letter and one digit.
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(PASSWORD_PATTERN, {
    message: 'Password must be at least 8 characters and include a letter and a number',
  })
  password: string;

  @IsString()
  @Length(2, 100)
  name: string;

  @IsIn(AGE_RANGES)
  ageRange: (typeof AGE_RANGES)[number];

  @IsIn(GENDERS)
  gender: (typeof GENDERS)[number];

  @IsIn(CITIES)
  city: (typeof CITIES)[number];

  // Required at signup, not just for login: phone is the Consumer's
  // Campaign-participation-verification identity (see CampaignVerification),
  // distinct from email/password account identity.
  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, {
    message: 'phone must be a valid international phone number',
  })
  phone: string;
}

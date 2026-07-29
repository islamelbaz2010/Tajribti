import { IsString, IsIn, Length, IsOptional } from 'class-validator';

const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'] as const;
const GENDERS = ['male', 'female', 'prefer_not_to_say'] as const;
const CITIES = ['Cairo', 'Giza', 'Alexandria', 'Other'] as const;
const INTERESTS = [
  'food_beverages',
  'beauty_personal_care',
  'health_wellness',
  'home_care',
  'electronics',
  'fashion',
] as const;

export class RegisterDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsIn(AGE_RANGES)
  ageRange: (typeof AGE_RANGES)[number];

  @IsIn(GENDERS)
  gender: (typeof GENDERS)[number];

  @IsIn(CITIES)
  city: (typeof CITIES)[number];

  @IsOptional()
  @IsIn(INTERESTS)
  interest?: (typeof INTERESTS)[number];
}

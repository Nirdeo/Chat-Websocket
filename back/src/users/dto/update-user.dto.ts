import { IsEmail, IsString, MinLength, Matches, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Le nom d\'utilisateur doit être une chaîne de caractères' })
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'L\'email doit être une adresse email valide' })
  email?: string;

  @IsOptional()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Le mot de passe doit contenir au moins une lettre minuscule, une lettre majuscule et un chiffre',
  })
  password?: string;

  @IsOptional()
  @IsString({ message: 'La couleur doit être une chaîne de caractères' })
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'La couleur doit être au format hexadécimal (ex: #FF5733)',
  })
  color?: string;
} 
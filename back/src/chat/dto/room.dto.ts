import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, {
    message: 'Le nom de la salle doit contenir au moins 3 caractères',
  })
  @MaxLength(50, {
    message: 'Le nom de la salle ne peut pas dépasser 50 caractères',
  })
  name: string;
}

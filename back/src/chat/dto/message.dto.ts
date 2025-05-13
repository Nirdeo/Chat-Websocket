import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class MessageDto {
  @IsNotEmpty({ message: 'L\'ID de la salle est requis' })
  @IsString({ message: 'L\'ID de la salle doit être une chaîne de caractères' })
  roomId: string;

  @IsNotEmpty({ message: 'Le message est requis' })
  @IsString({ message: 'Le message doit être une chaîne de caractères' })
  message: string;

  @IsNotEmpty({ message: 'L\'expéditeur est requis' })
  @IsString({ message: 'L\'expéditeur doit être une chaîne de caractères' })
  sender: string;
  
  @IsOptional()
  @IsString({ message: 'La couleur doit être une chaîne de caractères' })
  color?: string;
} 
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: any) {
    try {
      // Vérifier que l'utilisateur existe toujours
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, username: true, email: true, color: true },
      });

      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      return {
        id: user.id,
        sub: user.id,
        username: user.username,
        email: user.email,
        color: user.color,
      };
    } catch (error) {
      throw new UnauthorizedException('Token invalide');
    }
  }
}

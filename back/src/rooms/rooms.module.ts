import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RoomsController],
  providers: [PrismaService],
})
export class RoomsModule {}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from '../chat/dto/room.dto';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll() {
    return this.prisma.room.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                color: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
          take: 50, // Limite les 50 derniers messages
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Salle non trouvée');
    }

    return room;
  }

  @Post()
  async create(@Body() createRoomDto: CreateRoomDto) {
    const existingRoom = await this.prisma.room.findUnique({
      where: { name: createRoomDto.name },
    });

    if (existingRoom) {
      throw new ForbiddenException('Une salle avec ce nom existe déjà');
    }

    return this.prisma.room.create({
      data: {
        name: createRoomDto.name,
      },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      throw new NotFoundException('Salle non trouvée');
    }

    await this.prisma.message.deleteMany({
      where: { roomId: id },
    });

    return this.prisma.room.delete({
      where: { id },
    });
  }
}

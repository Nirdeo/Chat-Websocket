import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/room.dto';

interface SaveMessageParams {
  roomId: string;
  message: string;
  sender: string;
}

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createRoom(createRoomDto: CreateRoomDto) {
    return this.prisma.room.create({
      data: {
        name: createRoomDto.name,
      },
    });
  }

  async findRoomByName(name: string) {
    return this.prisma.room.findUnique({
      where: { name },
    });
  }

  async findRoomById(id: string) {
    return this.prisma.room.findUnique({
      where: { id },
      include: {
        messages: {
          include: {
            sender: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async saveMessage({ roomId, message, sender }: SaveMessageParams) {
    return this.prisma.message.create({
      data: {
        content: message,
        senderId: sender,
        roomId: roomId,
      },
      include: {
        sender: true,
      },
    });
  }

  async getRoomMessages(roomId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        roomId,
      },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages.map((message) => ({
      id: message.id,
      content: message.content,
      sender: {
        username: message.sender.username,
        color: message.sender.color,
      },
      createdAt: message.createdAt,
    }));
  }
}

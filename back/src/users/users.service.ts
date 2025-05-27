import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

import { User } from '../generated/prisma/client';

type UserWithoutPassword = Omit<User, 'password'>;

import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<UserWithoutPassword[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        color: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as Promise<UserWithoutPassword[]>;
  }

  findOne(id: string): Promise<UserWithoutPassword | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        color: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as Promise<UserWithoutPassword | null>;
  }

  findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        color: true,
        createdAt: true,
        updatedAt: true,
        password: true,
      },
    });
  }

  async create(data: Omit<Prisma.UserCreateInput, 'password'> & { password: string }): Promise<UserWithoutPassword> {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        color: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as Promise<UserWithoutPassword>;
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<UserWithoutPassword> {
    if (data.password && typeof data.password === 'string') {
      data.password = await bcrypt.hash(data.password, 12);
    }
    
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        color: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as Promise<UserWithoutPassword>;
  }

  async remove(id: string): Promise<UserWithoutPassword> {
    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        color: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as Promise<UserWithoutPassword>;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

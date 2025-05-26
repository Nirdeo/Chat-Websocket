import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageDto } from './dto/message.dto';
import { SignalDto } from './dto/signal.dto';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: false,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  private rooms: Map<string, Set<string>> = new Map();

  private userSockets: Map<string, Set<string>> = new Map();

  private getUserCount(): number {
    return this.userSockets.size;
  }

  private emitOnlineUsersCount() {
    const count = this.getUserCount();
    this.server.emit('online-users-count', count);
    console.log(`Nombre d'utilisateurs en ligne: ${count}`);
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        throw new UnauthorizedException('Token manquant');
      }

      const payload = this.jwtService.verify(token);
      if (!payload) {
        throw new UnauthorizedException('Token invalide');
      }

      client.data.user = payload;
      console.log('Socket connecté:', client.id);
    } catch (error) {
      console.error("Erreur d'authentification:", error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Socket déconnecté:', client.id);

    let userToUpdate: string | null = null;

    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        userToUpdate = userId;

        if (sockets.size === 0) {
          this.userSockets.delete(userId);
          console.log(`Utilisateur ${userId} complètement déconnecté`);
        } else {
          console.log(
            `Utilisateur ${userId} a encore ${sockets.size} connexion(s) active(s)`,
          );
        }
        break;
      }
    }

    this.rooms.forEach((clients, roomId) => {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        this.server.to(roomId).emit('user-disconnected', client.id);
      }
    });

    if (userToUpdate) {
      this.emitOnlineUsersCount();
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = typeof data === 'string' ? data : data.roomId;
    const username = typeof data === 'string' ? null : data.username;

    console.log(
      `Client ${client.id} rejoint la salle ${roomId}${username ? ` en tant que ${username}` : ''}`,
    );

    if (username) {
      if (!this.userSockets.has(username)) {
        this.userSockets.set(username, new Set());
        this.emitOnlineUsersCount();
      }

      this.userSockets.get(username)?.add(client.id);
    }

    client.join(roomId);

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set<string>());
    }

    const roomUsers = this.rooms.get(roomId);
    if (roomUsers) {
      roomUsers.add(client.id);
    }

    // Envoyer l'historique des messages
    const messages = await this.chatService.getRoomMessages(roomId);
    client.emit('message-history', messages);

    client.to(roomId).emit('user-connected', client.id);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: MessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, message, sender } = data;
    console.log(`Message de ${sender} dans la salle ${roomId}: ${message}`);

    if (!client.data.user) {
      console.error('Utilisateur non authentifié');
      return;
    }

    try {
      // Sauvegarder le message en base de données
      const savedMessage = await this.chatService.saveMessage({
        roomId,
        message,
        sender: client.data.user.id, // Utiliser l'ID de l'utilisateur du token
      });

      if (!this.userSockets.has(sender)) {
        this.userSockets.set(sender, new Set([client.id]));
        this.emitOnlineUsersCount();
      } else {
        this.userSockets.get(sender)?.add(client.id);
      }

      // Émettre le message avec les informations complètes
      this.server.to(roomId).emit('message', {
        id: savedMessage.id,
        content: savedMessage.content,
        sender: {
          username: savedMessage.sender.username,
          color: savedMessage.sender.color,
        },
        createdAt: savedMessage.createdAt,
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du message:', error);
      client.emit('message-error', "Erreur lors de l'envoi du message");
    }
  }

  @SubscribeMessage('signal')
  handleSignal(
    @MessageBody() data: SignalDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { userId, signal } = data;
    console.log(`Signal de ${client.id} pour ${userId}`);

    this.server.to(userId).emit('signal', { userId: client.id, signal });
  }
}

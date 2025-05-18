import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageDto } from './dto/message.dto';
import { SignalDto } from './dto/signal.dto';

@WebSocketGateway({ 
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: false,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

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
    console.log('Socket connecté:', client.id);
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
          console.log(`Utilisateur ${userId} a encore ${sockets.size} connexion(s) active(s)`);
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
  handleJoinRoom(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const roomId = typeof data === 'string' ? data : data.roomId;
    const username = typeof data === 'string' ? null : data.username;
    
    console.log(`Client ${client.id} rejoint la salle ${roomId}${username ? ` en tant que ${username}` : ''}`);
    
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
    
    client.to(roomId).emit('user-connected', client.id);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: MessageDto, @ConnectedSocket() client: Socket) {
    const { roomId, message, sender, color } = data;
    console.log(`Message de ${sender} dans la salle ${roomId}: ${message}`);
    
    if (!this.userSockets.has(sender)) {
      this.userSockets.set(sender, new Set([client.id]));
      this.emitOnlineUsersCount();
    } else {
      this.userSockets.get(sender)?.add(client.id);
    }
    
    this.server.to(roomId).emit('message', { message, sender, color });
  }

  @SubscribeMessage('signal')
  handleSignal(@MessageBody() data: SignalDto, @ConnectedSocket() client: Socket) {
    const { userId, signal } = data;
    console.log(`Signal de ${client.id} pour ${userId}`);
    
    this.server.to(userId).emit('signal', { userId: client.id, signal });
  }
}

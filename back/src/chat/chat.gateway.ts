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

  // Map pour suivre les utilisateurs par salle
  private rooms: Map<string, Set<string>> = new Map();
  
  // Map pour suivre les utilisateurs réels avec leurs sockets
  // Clé: username ou clientId fourni par le client, Valeur: Set des IDs de socket
  private userSockets: Map<string, Set<string>> = new Map();
  
  // Obtenir le nombre réel d'utilisateurs connectés (et non le nombre de sockets)
  private getUserCount(): number {
    return this.userSockets.size;
  }

  // Émettre le nombre d'utilisateurs en ligne
  private emitOnlineUsersCount() {
    const count = this.getUserCount();
    this.server.emit('online-users-count', count);
    console.log(`Nombre d'utilisateurs en ligne: ${count}`);
  }

  handleConnection(client: Socket) {
    console.log('Socket connecté:', client.id);
    // On ne compte pas encore comme un utilisateur - on attendra qu'il s'identifie
  }

  handleDisconnect(client: Socket) {
    console.log('Socket déconnecté:', client.id);
    
    // Trouver et supprimer la socket de l'utilisateur
    let userToUpdate: string | null = null;
    
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        userToUpdate = userId;
        
        // Si c'était la dernière socket de cet utilisateur, supprimer l'utilisateur
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
          console.log(`Utilisateur ${userId} complètement déconnecté`);
        } else {
          console.log(`Utilisateur ${userId} a encore ${sockets.size} connexion(s) active(s)`);
        }
        break;
      }
    }
    
    // Notifier les autres clients dans toutes les salles où ce client était présent
    this.rooms.forEach((clients, roomId) => {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        this.server.to(roomId).emit('user-disconnected', client.id);
      }
    });
    
    // Émettre le nouveau nombre d'utilisateurs en ligne seulement si un utilisateur a été affecté
    if (userToUpdate) {
      this.emitOnlineUsersCount();
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // On accepte soit une simple chaîne roomId, soit un objet avec roomId et d'autres données
    const roomId = typeof data === 'string' ? data : data.roomId;
    const username = typeof data === 'string' ? null : data.username;
    
    console.log(`Client ${client.id} rejoint la salle ${roomId}${username ? ` en tant que ${username}` : ''}`);
    
    // Si un nom d'utilisateur est fourni, l'utiliser comme identifiant d'utilisateur
    if (username) {
      // Enregistrer cet utilisateur avec sa socket
      if (!this.userSockets.has(username)) {
        this.userSockets.set(username, new Set());
        // C'est un nouvel utilisateur, émettre le nouveau nombre
        this.emitOnlineUsersCount();
      }
      
      this.userSockets.get(username)?.add(client.id);
    }
    
    // Rejoindre la salle Socket.io
    client.join(roomId);
    
    // Suivre l'utilisateur dans cette salle
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set<string>());
    }
    
    // Vérification pour éviter l'erreur "Object is possibly 'undefined'"
    const roomUsers = this.rooms.get(roomId);
    if (roomUsers) {
      roomUsers.add(client.id);
    }
    
    // Informer les autres clients dans la salle qu'un nouvel utilisateur est arrivé
    client.to(roomId).emit('user-connected', client.id);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: MessageDto, @ConnectedSocket() client: Socket) {
    const { roomId, message, sender, color } = data;
    console.log(`Message de ${sender} dans la salle ${roomId}: ${message}`);
    
    // Si c'est le premier message d'un utilisateur, l'enregistrer maintenant
    if (!this.userSockets.has(sender)) {
      this.userSockets.set(sender, new Set([client.id]));
      this.emitOnlineUsersCount();
    } else {
      // Assurez-vous que cet ID de socket est associé à cet utilisateur
      this.userSockets.get(sender)?.add(client.id);
    }
    
    // Diffuser le message à tous les clients dans la salle
    this.server.to(roomId).emit('message', { message, sender, color });
  }

  @SubscribeMessage('signal')
  handleSignal(@MessageBody() data: SignalDto, @ConnectedSocket() client: Socket) {
    const { userId, signal } = data;
    console.log(`Signal de ${client.id} pour ${userId}`);
    
    // Transmettre le signal au client spécifié
    this.server.to(userId).emit('signal', { userId: client.id, signal });
  }
}

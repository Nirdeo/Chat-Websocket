import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [onlineUsersCount, setOnlineUsersCount] = useState<number>(0);

  useEffect(() => {
    let newSocket: Socket | null = null;
    
    try {
      console.log('Tentative de connexion au serveur WebSocket...');
      
      // Configuration ultra-basique
      newSocket = io('http://localhost:3001', {
        autoConnect: true,
        reconnection: true,
        transports: ['websocket', 'polling']
      });
      
      newSocket.on('connect', () => {
        console.log('✅ Connecté au serveur WebSocket:', newSocket?.id);
        setIsConnected(true);
      });

      newSocket.on('connect_error', (error: Error) => {
        console.error('❌ Erreur de connexion WebSocket:', error.message);
        setIsConnected(false);
      });

      newSocket.on('disconnect', () => {
        console.log('⚠️ Déconnecté du serveur WebSocket');
        setIsConnected(false);
      });

      newSocket.on('online-users-count', (count: number) => {
        console.log(`Nombre d'utilisateurs en ligne reçu: ${count}`);
        setOnlineUsersCount(count);
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du socket:', error);
      setIsConnected(false);
    }

    return () => {
      if (newSocket) {
        console.log('Fermeture de la connexion Socket.IO');
        newSocket.disconnect();
      }
    };
  }, []);

  const joinRoom = useCallback((roomId: string, username: string) => {
    if (socket && isConnected) {
      console.log(`${username} rejoint la salle: ${roomId}`);
      socket.emit('join-room', { roomId, username });
    } else {
      console.warn('Impossible de rejoindre la salle: socket non connecté');
    }
  }, [socket, isConnected]);

  const sendMessage = useCallback((roomId: string, message: string, sender: string) => {
    if (socket && isConnected) {
      console.log(`Envoi du message de ${sender} dans la salle ${roomId}`);
      socket.emit('message', { roomId, message, sender });
    } else {
      console.warn('Impossible d\'envoyer le message: socket non connecté');
    }
  }, [socket, isConnected]);

  return { socket, isConnected, onlineUsersCount, joinRoom, sendMessage };
};

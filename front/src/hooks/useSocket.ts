import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [onlineUsersCount, setOnlineUsersCount] = useState<number>(0);
  const router = useRouter();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  useEffect(() => {
    let newSocket: Socket | null = null;

    const initSocket = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Pas de token trouvé");
        router.replace("/auth/login");
        return;
      }

      try {
        console.log("Tentative de connexion au serveur WebSocket...");

        newSocket = io("http://localhost:3001", {
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: maxReconnectAttempts,
          transports: ["websocket", "polling"],
          auth: {
            token,
          },
        });

        newSocket.on("connect", () => {
          console.log("✅ Connecté au serveur WebSocket:", newSocket?.id);
          setIsConnected(true);
          reconnectAttempts.current = 0;
        });

        newSocket.on("connect_error", (error: Error) => {
          console.error("❌ Erreur de connexion WebSocket:", error.message);
          setIsConnected(false);
          reconnectAttempts.current++;

          if (
            error.message.includes("Token") ||
            reconnectAttempts.current >= maxReconnectAttempts
          ) {
            console.error(
              "Erreur d'authentification ou nombre maximal de tentatives atteint"
            );
            localStorage.removeItem("token");
            router.replace("/auth/login");
          }
        });

        newSocket.on("disconnect", (reason) => {
          console.log("⚠️ Déconnecté du serveur WebSocket:", reason);
          setIsConnected(false);

          if (reason === "io server disconnect") {
            // supprimer le token
            localStorage.removeItem("token");
            router.replace("/auth/login");
          }
        });

        newSocket.on("online-users-count", (count: number) => {
          console.log(`Nombre d'utilisateurs en ligne reçu: ${count}`);
          setOnlineUsersCount(count);
        });

        setSocket(newSocket);
      } catch (error) {
        console.error("Erreur lors de l'initialisation du socket:", error);
        setIsConnected(false);
      }
    };

    initSocket();

    return () => {
      if (newSocket) {
        console.log("Fermeture de la connexion Socket.IO");
        newSocket.disconnect();
      }
    };
  }, [router]);

  const joinRoom = useCallback(
    (roomId: string, username: string) => {
      if (!socket) {
        console.error("Socket non initialisé");
        return;
      }

      if (!isConnected) {
        console.warn("Socket non connecté");
        return;
      }

      console.log(`${username} rejoint la salle: ${roomId}`);
      socket.emit("join-room", { roomId, username });
    },
    [socket, isConnected]
  );

  const sendMessage = useCallback(
    (roomId: string, message: string, sender: string) => {
      if (!socket) {
        console.error("Socket non initialisé");
        return;
      }

      if (!isConnected) {
        console.warn("Socket non connecté");
        return;
      }

      console.log(`Envoi du message de ${sender} dans la salle ${roomId}`);
      socket.emit("message", { roomId, message, sender });
    },
    [socket, isConnected]
  );

  return {
    socket,
    isConnected,
    onlineUsersCount,
    joinRoom,
    sendMessage,
  };
};

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useSocket } from "@/hooks/useSocket";
import { useWebRTC } from "@/hooks/useWebRTC";
import Chat from "@/components/Chat";
import VideoChat from "@/components/VideoChat";
import CallControls from "@/components/CallControls";
import { use } from "react";

interface JwtPayload {
  id: string;
  username: string;
  color: string;
}

interface PageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default function RoomPage({ params }: PageProps) {
  const router = useRouter();
  const { roomId } = use(params);

  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [userColor, setUserColor] = useState("#3B82F6");
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { socket, isConnected, onlineUsersCount, joinRoom } = useSocket();
  const { stream, remoteStreams, startCall, endCall } = useWebRTC(
    socket,
    roomId
  );

  useEffect(() => {
    let isMounted = true;

    const initializeRoom = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      try {
        const validationResponse = await fetch(
          "http://localhost:3001/auth/validate",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!validationResponse.ok) {
          throw new Error("Token invalide");
        }

        const decoded = jwtDecode<JwtPayload>(token);
        if (!decoded.username || !decoded.color || !decoded.id) {
          throw new Error("Token invalide");
        }

        if (isMounted) {
          setUsername(decoded.username);
          setUserId(decoded.id);
          setUserColor(decoded.color);
        }

        const roomResponse = await fetch(
          `http://localhost:3001/rooms/${roomId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!roomResponse.ok) {
          throw new Error("Cette salle n'existe pas");
        }

        const room = await roomResponse.json();
        if (isMounted) {
          setRoomName(room.name);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erreur:", error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : "Erreur inconnue");
          setIsLoading(false);
        }
      }
    };

    initializeRoom();

    return () => {
      isMounted = false;
    };
  }, [router, roomId]);

  
  useEffect(() => {
    if (isConnected && username && !isLoading) {
      joinRoom(roomId, username);
    }
  }, [isConnected, username, roomId, joinRoom, isLoading]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
        <button
          onClick={() => router.push("/chat")}
          className="text-blue-500 hover:underline"
        >
          Retourner à la liste des salles
        </button>
      </div>
    );
  }

  if (isLoading || !isConnected) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Chargement de la salle...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{roomName || "Chargement..."}</h1>
          <p className="text-gray-600">ID: {roomId}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/chat")}
            className="text-blue-500 hover:underline"
          >
            Retour aux salles
          </button>
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
            {onlineUsersCount} utilisateur{onlineUsersCount !== 1 ? "s" : ""} en
            ligne
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <VideoChat localStream={stream} remoteStreams={remoteStreams} />
          <CallControls onStartCall={startCall} onEndCall={endCall} />
        </div>

        <div className="h-[600px]">
          <Chat
            socket={socket}
            roomId={roomId}
            username={username}
            userId={userId}
            userColor={userColor}
          />
        </div>
      </div>
    </div>
  );
}

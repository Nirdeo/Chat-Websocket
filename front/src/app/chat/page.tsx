'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import Chat from '@/components/Chat';
import VideoChat from '@/components/VideoChat';
import CallControls from '@/components/CallControls';

interface JwtPayload {
  username: string;
  color: string;
}

export default function ChatPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [userColor, setUserColor] = useState('#3B82F6');
  const [isJoined, setIsJoined] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('En attente de connexion...');

  const { socket, isConnected, onlineUsersCount, joinRoom } = useSocket();
  const { stream, remoteStreams, startCall, endCall } = useWebRTC(socket, roomId);

  async function checkTokenValidity(token: string): Promise<boolean> {
    try {
      const res = await fetch('http://localhost:3001/auth/validate', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return false;
      const data = await res.json();
      return data.valid === true;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    // check de la validité du token
    checkTokenValidity(token).then(isValid => {
      if (!isValid) {
        router.replace('/auth/login');
        return;
      }

      try {
        const decoded = jwtDecode<JwtPayload>(token);
        if (!decoded.username || !decoded.color) {
          router.replace('/auth/login');
          return;
        }
        setUsername(decoded.username);
        setUserColor(decoded.color);
      } catch {
        router.replace('/auth/login');
      }
    });
  }, [router]);

  useEffect(() => {
    setConnectionStatus(isConnected ? 'Connecté' : 'Tentative de connexion au serveur...');
  }, [isConnected]);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) return;

    if (isConnected) {
      joinRoom(roomId, username);
      setIsJoined(true);
    } else {
      alert("Impossible de rejoindre la salle : la connexion au serveur n'est pas établie. Réessayez dans quelques instants.");
    }
  };

  if (!isConnected && !isJoined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Connexion au serveur...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">Chat WebSocket & WebRTC</h1>

      {!isJoined ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Rejoindre une salle</h2>

          <div className="mb-4 flex justify-between items-center">
            <p className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
              Statut: {connectionStatus}
            </p>
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
              {onlineUsersCount} utilisateur{onlineUsersCount !== 1 ? 's' : ''} en ligne
            </div>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                ID de la salle
              </label>
              <input
                id="roomId"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>

            <button
              type="submit"
              className={`w-full font-bold py-2 px-4 rounded-md text-white ${
                isConnected ? 'hover:opacity-90' : 'bg-gray-400 cursor-not-allowed opacity-70'
              }`}
              disabled={!isConnected}
              style={{ backgroundColor: isConnected ? userColor : undefined }}
            >
              Rejoindre
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Salle: {roomId}</h2>
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
                {onlineUsersCount} utilisateur{onlineUsersCount !== 1 ? 's' : ''} en ligne
              </div>
            </div>

            <VideoChat localStream={stream} remoteStreams={remoteStreams} />
            <CallControls onStartCall={startCall} onEndCall={endCall} />
          </div>

          <div className="h-[500px]">
            <Chat socket={socket} roomId={roomId} username={username} userColor={userColor} />
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import Chat from '@/components/Chat';
import VideoChat from '@/components/VideoChat';
import CallControls from '@/components/CallControls';

// Couleurs prédéfinies pour le sélecteur
const PREDEFINED_COLORS = [
  '#3B82F6', // blue-500
  '#EF4444', // red-500
  '#10B981', // green-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#6366F1', // indigo-500
  '#D946EF', // fuchsia-500
  '#F97316', // orange-500
];

export default function ChatPage() {
  const [username, setUsername] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [userColor, setUserColor] = useState<string>('#3B82F6'); // Bleu par défaut
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('En attente de connexion...');
  
  const { socket, isConnected, onlineUsersCount, joinRoom } = useSocket();
  const { stream, remoteStreams, startCall, endCall } = useWebRTC(socket, roomId);

  useEffect(() => {
    // Mise à jour du statut de connexion
    if (isConnected) {
      setConnectionStatus('Connecté');
    } else {
      setConnectionStatus('Tentative de connexion au serveur...');
    }
  }, [isConnected]);

  // Rejoindre la salle
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !roomId.trim()) return;
    
    if (isConnected) {
      joinRoom(roomId, username);
      setIsJoined(true);
    } else {
      alert('Impossible de rejoindre la salle : la connexion au serveur n\'est pas établie. Réessayez dans quelques instants.');
    }
  };

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
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">ID de la salle</label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Votre couleur</label>
              <div className="mt-1 flex items-center">
                <div 
                  className="h-8 w-8 rounded-full mr-2 border border-gray-300"
                  style={{ backgroundColor: userColor }}
                />
                <input
                  type="color"
                  value={userColor}
                  onChange={(e) => setUserColor(e.target.value)}
                  className="hidden" // Caché, nous utilisons notre propre UI
                  id="color-picker"
                />
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-6 w-6 rounded-full border ${userColor === color ? 'border-gray-700 ring-2 ring-offset-2' : 'border-gray-300'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setUserColor(color)}
                    />
                  ))}
                  <label 
                    htmlFor="color-picker" 
                    className="h-6 w-6 rounded-full border border-gray-300 flex items-center justify-center bg-gray-100 cursor-pointer"
                    title="Choisir une couleur personnalisée"
                  >
                    <span className="text-xs">+</span>
                  </label>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className={`w-full font-bold py-2 px-4 rounded-md text-white ${
                isConnected 
                  ? 'hover:opacity-90' 
                  : 'bg-gray-400 cursor-not-allowed opacity-70'
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
import { useState, useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';

interface ChatProps {
  socket: Socket | null;
  roomId: string;
  username: string;
  userColor: string;
}

interface Message {
  message: string;
  sender: string;
  color?: string;
  time: Date;
}

export default function Chat({ socket, roomId, username, userColor }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = ({ message, sender, color }: { message: string, sender: string, color?: string }) => {
      setMessages(prev => [...prev, { message, sender, color, time: new Date() }]);
    };

    socket.on('message', handleMessage);

    return () => {
      socket.off('message', handleMessage);
    };
  }, [socket]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !inputMessage.trim()) return;

    socket.emit('message', {
      roomId,
      message: inputMessage,
      sender: username,
      color: userColor
    });

    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Chat</h2>
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, idx) => {
          const isCurrentUser = msg.sender === username;
          const bgColor = isCurrentUser 
            ? userColor 
            : (msg.color || '#e5e7eb'); // Utilise la couleur fournie ou gris par défaut
          
          // Ajuste la couleur du texte en fonction de la luminosité du fond
          const getTextColor = (hexColor: string) => {
            // Convertit la couleur hexadécimale en RGB
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);
            
            // Calcule la luminosité (formule simplifiée)
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            
            // Si la luminosité est élevée (couleur claire), utiliser du texte foncé
            return luminance > 0.5 ? 'text-gray-800' : 'text-white';
          };
          
          const textColor = getTextColor(bgColor);
          
          return (
            <div 
              key={idx} 
              className={`p-2 rounded-lg max-w-[80%] ${textColor} ${
                isCurrentUser ? 'ml-auto' : ''
              }`}
              style={{ backgroundColor: bgColor }}
            >
              <div className="font-bold text-sm">{msg.sender}</div>
              <div>{msg.message}</div>
              <div className="text-xs opacity-70">
                {new Date(msg.time).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Entrez votre message..."
        />
        <button 
          type="submit" 
          className="text-white px-4 rounded-r-lg hover:opacity-90"
          style={{ backgroundColor: userColor }}
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}

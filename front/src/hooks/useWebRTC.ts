import { useState, useEffect, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import Peer from 'simple-peer';

type PeerMap = {
  [userId: string]: Peer.Instance;
};

type StreamMap = {
  [userId: string]: MediaStream;
};

export const useWebRTC = (socket: Socket | null, roomId: string) => {
  const [peers, setPeers] = useState<PeerMap>({});
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<StreamMap>({});
  const peersRef = useRef<PeerMap>({});

  // Initialisation de la vidéo locale
  const initLocalStream = useCallback(async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setStream(localStream);
      return localStream;
    } catch (error) {
      console.error('Erreur accès caméra/micro:', error);
      return null;
    }
  }, []);

  // Créer un peer (connexion WebRTC)
  const createPeer = useCallback((userId: string, localStream: MediaStream, initiator = false) => {
    const peer = new Peer({
      initiator,
      trickle: false,
      stream: localStream
    });

    peer.on('signal', (signal) => {
      if (socket) {
        socket.emit('signal', { userId, signal });
      }
    });

    peer.on('stream', (remoteStream) => {
      setRemoteStreams(prev => ({
        ...prev,
        [userId]: remoteStream
      }));
    });

    return peer;
  }, [socket]);

  // Démarrer l'appel
  const startCall = useCallback(async () => {
    if (!socket || !roomId) return;

    const localStream = await initLocalStream();
    if (!localStream) return;

    socket.on('user-connected', (userId: string) => {
      console.log('Nouvel utilisateur connecté:', userId);
      const peer = createPeer(userId, localStream, true);
      peersRef.current[userId] = peer;
      setPeers(prev => ({ ...prev, [userId]: peer }));
    });

    socket.on('signal', ({ userId, signal }: { userId: string, signal: any }) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].signal(signal);
      } else {
        const peer = createPeer(userId, localStream);
        peer.signal(signal);
        peersRef.current[userId] = peer;
        setPeers(prev => ({ ...prev, [userId]: peer }));
      }
    });

    socket.on('user-disconnected', (userId: string) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].destroy();
        delete peersRef.current[userId];
        setPeers(prev => {
          const newPeers = { ...prev };
          delete newPeers[userId];
          return newPeers;
        });
        setRemoteStreams(prev => {
          const newStreams = { ...prev };
          delete newStreams[userId];
          return newStreams;
        });
      }
    });

    // Rejoindre la salle
    socket.emit('join-room', roomId);
  }, [socket, roomId, createPeer, initLocalStream]);

  // Arrêter l'appel
  const endCall = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    Object.values(peersRef.current).forEach(peer => {
      if (peer) peer.destroy();
    });

    setPeers({});
    setRemoteStreams({});
    peersRef.current = {};
  }, [stream]);

  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    stream,
    remoteStreams,
    startCall,
    endCall
  };
};

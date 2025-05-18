import { useEffect, useRef } from 'react';

interface VideoChatProps {
  localStream: MediaStream | null;
  remoteStreams: {
    [userId: string]: MediaStream;
  };
}

interface VideoProps {
  stream: MediaStream;
}

export default function VideoChat({ localStream, remoteStreams }: VideoChatProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="relative">
        <h3 className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-1 rounded">Vous</h3>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover rounded-lg border-2 border-blue-500"
        />
      </div>
      
      {Object.entries(remoteStreams).map(([userId, stream]) => (
        <div key={userId} className="relative">
          <h3 className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-1 rounded">
            Participant {userId.slice(0, 5)}
          </h3>
          <Video stream={stream} />
        </div>
      ))}
    </div>
  );
}

function Video({ stream }: VideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);
  
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      className="w-full h-full object-cover rounded-lg border-2 border-green-500"
    />
  );
}

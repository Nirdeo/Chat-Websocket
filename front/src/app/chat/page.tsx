"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";

interface JwtPayload {
  id: string;
  username: string;
  color: string;
}

interface Room {
  id: string;
  name: string;
  createdAt: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    checkTokenValidity(token).then(async (isValid) => {
      if (!isValid) {
        router.replace("/auth/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:3001/rooms", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des salles");
        }

        const roomsList = await response.json();
        setRooms(roomsList);
      } catch (error) {
        console.error("Erreur:", error);
        setError("Erreur lors du chargement des salles");
      }
    });
  }, [router]);

  async function checkTokenValidity(token: string): Promise<boolean> {
    try {
      const res = await fetch("http://localhost:3001/auth/validate", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return false;
      const data = await res.json();
      return data.valid === true;
    } catch {
      return false;
    }
  }

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    try {
      setIsCreatingRoom(true);
      setError(null);

      const response = await fetch("http://localhost:3001/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: roomName }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la salle");
      }

      const room = await response.json();
      router.push(`/chat/${room.id}`);
    } catch (error) {
      console.error("Erreur lors de la création de la salle:", error);
      setError(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Salles de Chat</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Créer une nouvelle salle
          </h2>
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label
                htmlFor="roomName"
                className="block text-sm font-medium text-gray-700"
              >
                Nom de la salle
              </label>
              <input
                id="roomName"
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Entrez le nom de la salle"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isCreatingRoom || !roomName.trim()}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                isCreatingRoom || !roomName.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isCreatingRoom ? "Création..." : "Créer la salle"}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Salles disponibles</h2>
          {rooms.length === 0 ? (
            <p className="text-gray-500">Aucune salle disponible</p>
          ) : (
            <div className="space-y-2">
              {rooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/chat/${room.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">{room.name}</div>
                  <div className="text-sm text-gray-500">
                    Créée le {new Date(room.createdAt).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

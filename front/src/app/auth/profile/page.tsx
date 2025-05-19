'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

type JwtPayload = {
  sub: string;
};

export default function EditProfile() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: '',
    email: '',
    color: '',
  });
  const [userId, setUserId] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Token introuvable.");
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      setUserId(decoded.sub);
    } catch {
      setError("Token invalide.");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:3001/users/${userId}`);
        const data = await res.json();
        if (res.ok) {
          setForm({
            username: data.username || '',
            email: data.email || '',
            color: data.color || '',
          });
        } else {
          setError('Erreur lors du chargement du profil');
        }
      } catch {
        setError('Erreur réseau');
      }
    };

    if (userId) fetchProfile();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      const res = await fetch(`http://localhost:3001/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Erreur lors de la mise à jour');
        return;
      }

      // Déconnexion
      localStorage.removeItem('token');
      setSuccess('Profil mis à jour. Déconnexion...');

      setTimeout(() => {
        router.push('/auth/login'); // Redirection vers page de connexion
      }, 1500);
    } catch {
      setError('Erreur réseau');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Modifier le profil</h2>

        {success && (
          <div className="mb-4 bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm text-center">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
            <input
              type="color"
              name="color"
              value={form.color}
              onChange={handleChange}
              className="w-full h-10 p-1 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </main>
  );
}

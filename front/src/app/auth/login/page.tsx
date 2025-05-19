'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [checkingToken, setCheckingToken] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkToken() {
      const token = localStorage.getItem('token');
      if (!token) {
        setCheckingToken(false);
        return;
      }
      try {
        const res = await fetch('http://localhost:3001/auth/validate', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.valid) {
          router.replace('/chat');
        } else {
          localStorage.removeItem('token');
          setCheckingToken(false);
        }
      } catch {
        setCheckingToken(false);
      }
    }
    checkToken();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Erreur de connexion');
        return;
      }

      localStorage.setItem('token', data.access_token);
      router.replace('/chat');
    } catch {
      setError('Erreur réseau');
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-600 text-sm">Vérification du token...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Connexion</h1>
          <p className="text-gray-500 text-sm mt-2">
            Entrez vos informations pour accéder au chat.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Adresse e-mail"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Se connecter
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}

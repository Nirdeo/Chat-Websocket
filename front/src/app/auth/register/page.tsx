'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PREDEFINED_COLORS = [
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#6366F1',
  '#D946EF',
  '#F97316',
];

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    color: PREDEFINED_COLORS[0],
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color: string) => {
    setForm(prev => ({ ...prev, color }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setMessage(errorData.message || 'Erreur lors de la création du compte');
      } else {
        setMessage('Compte créé avec succès 🎉 Redirection...');
        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);
      }
    } catch {
      setMessage('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Créer un compte</h2>

        {message && (
          <p
            className={`text-center mb-4 text-sm ${
              message.includes('succès') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={form.username}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ton pseudo"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="exemple@mail.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Choisis ta couleur</label>
            <div className="flex items-center gap-3 flex-wrap">
              {PREDEFINED_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  style={{ backgroundColor: color }}
                  className={`h-8 w-8 rounded-full border-2 ${
                    form.color === color
                      ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-400'
                      : 'border-gray-300'
                  } transition-all`}
                  aria-label={`Sélectionner la couleur ${color}`}
                  disabled={loading}
                />
              ))}
              <input
                type="color"
                value={form.color}
                onChange={(e) => handleColorSelect(e.target.value)}
                disabled={loading}
                className="h-8 w-8 rounded-full border border-gray-300 cursor-pointer"
                title="Choisir une couleur personnalisée"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: form.color }}
            className="w-full text-white font-bold py-3 rounded-md hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Création...' : "S'inscrire"}
          </button>
        </form>
      </div>
    </div>
  );
}

// app/routes/register.tsx

// Página de registro de usuario. Permite crear una cuenta con email y contraseña.
// Usa tRPC para registrar y almacena el estado en la store global.

import { useState } from 'react';
import { useTodoProjectStore } from '~/utils/todoProjectStore';
import { trpc } from '~/utils/trpc';
import { useNavigate } from 'react-router';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const register = useTodoProjectStore(s => s.register);
  const loading = useTodoProjectStore(s => s.loadingUser);
  const error = useTodoProjectStore(s => s.errorUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password);
      navigate('/projects');
    } catch {}
  };

  return (
    <div className="container p-4 mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Registro</h1>
      {error && <div className="mb-2 text-red-500">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="p-2 border"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="p-2 border"
          required
        />
        <button
          type="submit"
          className="p-2 text-white bg-blue-500 disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
      <div className="mt-4 text-sm">
        ¿Ya tienes cuenta? <a href="/login" className="text-blue-400 underline">Inicia sesión</a>
      </div>
    </div>
  );
} 
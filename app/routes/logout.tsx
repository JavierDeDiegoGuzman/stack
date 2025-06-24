// app/routes/logout.tsx

// Página para cerrar sesión. Llama a tRPC para eliminar la cookie y limpia el estado de usuario en la store.

import { useEffect } from 'react';
import { useTodoProjectStore } from '~/utils/todoProjectStore';
import { trpc } from '~/utils/trpc';
import { useNavigate } from 'react-router';

export default function LogoutPage() {
  const logout = useTodoProjectStore(s => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    async function doLogout() {
      try {
        await logout();
      } catch {}
      navigate('/login');
    }
    doLogout();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="container p-4 mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Cerrando sesión...</h1>
    </div>
  );
} 
// app/routes/cookies.tsx

// Página para ver, añadir, editar y eliminar cookies del usuario usando tRPC.
// Utiliza llamadas directas a tRPC fuera de React, siguiendo el patrón de los otros componentes.

import { useEffect, useState } from 'react';
import { trpc } from '~/utils/trpc';

// Utilidad para truncar cadenas largas
function truncate(str: string, n = 60) {
  return str.length > n ? str.slice(0, n) + '...' : str;
}

export default function CookiesPage() {
  // Estado para las cookies actuales
  const [cookies, setCookies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Estado para añadir/editar cookies
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  // Carga las cookies al montar
  useEffect(() => {
    fetchCookies();
    // eslint-disable-next-line
  }, []);

  async function fetchCookies() {
    setLoading(true);
    setError(null);
    try {
      const data = await trpc.cookies.list.query();
      setCookies(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(name: string) {
    try {
      await trpc.cookies.delete.mutate({ name });
      await fetchCookies();
    } catch (e: any) {
      setError(e.message);
    }
  }

  function handleToggleExpand(name: string) {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  }

  async function handleEdit(name: string, value: string) {
    setEditing(name);
    setNewName(name);
    setNewValue(value);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await trpc.cookies.set.mutate({ name: newName, value: newValue });
      setEditing(null);
      setNewName('');
      setNewValue('');
      await fetchCookies();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      await trpc.cookies.set.mutate({ name: newName, value: newValue });
      setNewName('');
      setNewValue('');
      await fetchCookies();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="container p-4 mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">Cookies</h1>
      {error && <div className="mb-2 text-red-500">Error: {error}</div>}
      {loading ? (
        <div>Cargando cookies...</div>
      ) : (
        <ul className="mb-4 space-y-2">
          {Object.entries(cookies).length === 0 && <li>No hay cookies.</li>}
          {Object.entries(cookies).map(([name, value]) => {
            const isLong = value.length > 60;
            const isExpanded = expanded[name];
            return (
              <li key={name} className="flex flex-col bg-gray-800 rounded p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono break-all text-sm font-semibold text-blue-200">
                    {name}
                  </span>
                  <div className="flex gap-2 ml-2">
                    <button
                      className="text-xs text-yellow-600 hover:underline"
                      onClick={() => handleEdit(name, value)}
                    >Editar</button>
                    <button
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => handleDelete(name)}
                    >Eliminar</button>
                  </div>
                </div>
                <div className="mt-1">
                  <span className="font-mono text-xs break-all text-gray-200">
                    {isLong && !isExpanded ? truncate(value) : value}
                  </span>
                  {isLong && (
                    <button
                      className="ml-2 text-xs text-blue-400 hover:underline"
                      onClick={() => handleToggleExpand(name)}
                    >{isExpanded ? 'Colapsar' : 'Expandir'}</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {/* Formulario para añadir o editar cookies */}
      <form onSubmit={editing ? handleSave : handleAdd} className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Nombre"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="p-2 border flex-grow"
          disabled={!!editing}
        />
        <input
          type="text"
          placeholder="Valor"
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          className="p-2 border flex-grow"
        />
        <button type="submit" className="p-2 text-white bg-blue-500 disabled:bg-blue-300">
          {editing ? 'Guardar' : 'Añadir'}
        </button>
        {editing && (
          <button type="button" className="p-2 text-white bg-gray-400" onClick={() => { setEditing(null); setNewName(''); setNewValue(''); }}>
            Cancelar
          </button>
        )}
      </form>
    </div>
  );
} 
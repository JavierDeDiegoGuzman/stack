// app/routes/todos.tsx

// Esta página muestra una lista de "todos".
// Utiliza tRPC para comunicarse con el backend y obtener los datos.

import { useState } from "react";
import { trpc } from "~/utils/trpc";

export default function TodosPage() {
  const [newTodo, setNewTodo] = useState("");
  const utils = trpc.useContext();

  const { data: todos, isLoading, error } = trpc.todos.list.useQuery();

  const createMutation = trpc.todos.create.useMutation({
    onSuccess: () => {
      utils.todos.list.invalidate();
      setNewTodo("");
    },
  });

  const updateMutation = trpc.todos.update.useMutation({
    onSuccess: () => utils.todos.list.invalidate(),
  });

  const deleteMutation = trpc.todos.delete.useMutation({
    onSuccess: () => utils.todos.list.invalidate(),
  });

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      createMutation.mutate({ content: newTodo.trim() });
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error al cargar los todos: {error.message}</div>;
  }

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Lista de Todos</h1>

      <form onSubmit={handleCreateTodo} className="flex mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="p-2 border flex-grow"
          placeholder="Añadir un nuevo todo..."
          disabled={createMutation.isPending}
        />
        <button
          type="submit"
          className="p-2 ml-2 text-white bg-blue-500 disabled:bg-blue-300"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Añadiendo..." : "Añadir"}
        </button>
      </form>

      <ul>
        {todos?.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between p-2 border-b"
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={!!todo.completed}
                onChange={() =>
                  updateMutation.mutate({
                    id: todo.id,
                    completed: todo.completed ? 0 : 1,
                  })
                }
                className="mr-2"
                id={`todo-${todo.id}`}
              />
              <label
                htmlFor={`todo-${todo.id}`}
                className={todo.completed ? "line-through text-gray-500" : ""}
              >
                {todo.content}
              </label>
            </div>
            <button
              onClick={() => deleteMutation.mutate({ id: todo.id })}
              className="p-1 text-xs text-white bg-red-500 hover:bg-red-600"
            >
              Borrar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
} 
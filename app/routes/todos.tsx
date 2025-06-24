// app/routes/todos.tsx

// Esta página muestra una lista de "todos".
// Utiliza tRPC para comunicarse con el backend y obtener los datos.

import { useEffect, useState } from "react";
import { useTodoProjectStore } from "~/utils/todoProjectStore";
import type { Route } from "./+types/todos";
import { useNavigate } from "react-router";
import { trpcServer } from "~/utils/trpcServer";

// Loader SSR: obtiene los todos y los proyectos en el servidor
export async function loader({ params }: Route.LoaderArgs) {
  const projectId = Number(params.todoID);
  // Obtenemos los todos del proyecto y la lista de proyectos (para el nombre)
  const [todos, projects] = await Promise.all([
    trpcServer.todos.list.query({ projectId }),
    trpcServer.todos.listProjects.query(),
  ]);
  return { todos, projects, projectId };
}

export default function TodosPage({ params, loaderData }: Route.ComponentProps) {
  // Obtenemos el id del proyecto desde los parámetros de la ruta
  const projectId = Number(params.todoID);

  // Hook de navegación de react-router
  const navigate = useNavigate();

  // Usamos la store para obtener y manipular todos y proyectos
  const {
    getTodosByProject,
    loadingTodos,
    revalidatingTodos,
    errorTodos,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    projects,
    setTodosForProject, // Setter para hidratar Zustand
    setProjects, // Setter para hidratar proyectos
  } = useTodoProjectStore();

  // Obtenemos los todos cacheados de este proyecto
  const todos = getTodosByProject(projectId);

  // Obtenemos el nombre del proyecto desde la store
  const project = projects.find(p => p.id === projectId);
  const projectName = project ? project.name : `Proyecto #${projectId}`;

  const [newTodo, setNewTodo] = useState("");
  const [creatingTodo, setCreatingTodo] = useState(false);
  const [updatingTodos, setUpdatingTodos] = useState<Set<number>>(new Set());
  const [deletingTodos, setDeletingTodos] = useState<Set<number>>(new Set());

  // Hidratamos Zustand con los datos SSR al montar
  useEffect(() => {
    if (loaderData) {
      setTodosForProject(loaderData.projectId, loaderData.todos);
      setProjects(loaderData.projects);
    }
  }, [loaderData, setTodosForProject, setProjects]);

  // Cargamos los todos al montar o cambiar el proyecto
  useEffect(() => {
    fetchTodos(projectId);
  }, [fetchTodos, projectId]);

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      setCreatingTodo(true);
      try {
        await createTodo(newTodo.trim(), projectId);
        setNewTodo("");
      } catch (error) {
        console.error('Error al crear todo:', error);
      } finally {
        setCreatingTodo(false);
      }
    }
  };

  const handleUpdateTodo = async (id: number, completed: number) => {
    setUpdatingTodos(prev => new Set(prev).add(id));
    try {
      await updateTodo(id, completed);
    } catch (error) {
      console.error('Error al actualizar todo:', error);
    } finally {
      setUpdatingTodos(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDeleteTodo = async (id: number) => {
    setDeletingTodos(prev => new Set(prev).add(id));
    try {
      await deleteTodo(id);
    } catch (error) {
      console.error('Error al borrar todo:', error);
    } finally {
      setDeletingTodos(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Si no hay todos en caché y está cargando, mostramos loading inicial


  if (errorTodos) {
    return <div>Error al cargar los todos: {errorTodos}</div>;
  }

  return (
    <div className="container p-4 mx-auto">
      {/* Botón de volver atrás y título del proyecto */}
      <div className="flex items-center mb-4 gap-2">
        <button
          type="button"
          className="flex items-center px-3 py-1 text-base font-medium bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-800 disabled:text-gray-400"
          onClick={() => navigate(-1)}
        >
          <span className="mr-2">←</span>Volver
        </button>
        <h1 className="text-2xl font-bold text-white">{projectName}</h1>
      </div>

      <form onSubmit={handleCreateTodo} className="flex mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="p-2 border flex-grow"
          placeholder="Añadir un nuevo todo..."
        />
        <button
          type="submit"
          className="p-2 ml-2 text-white bg-blue-500 disabled:bg-blue-300"
          disabled={creatingTodo}
        >
          {creatingTodo ? "Añadiendo..." : "Añadir"}
        </button>
      </form>

      {/* Mostramos el mensaje de cargando debajo del formulario, sin bloquear la página */}
      {loadingTodos && (
        <div className="mb-2 text-gray-500">Cargando...</div>
      )}

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
                  handleUpdateTodo(todo.id, todo.completed ? 0 : 1)
                }
                className="mr-2"
                id={`todo-${todo.id}`}
                disabled={updatingTodos.has(todo.id)}
              />
              <label
                htmlFor={`todo-${todo.id}`}
                className={todo.completed ? "line-through text-gray-500" : ""}
              >
                {todo.content}
              </label>
            </div>
            <button
              onClick={() => handleDeleteTodo(todo.id)}
              className="p-1 text-xs text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300"
              disabled={deletingTodos.has(todo.id)}
            >
              {deletingTodos.has(todo.id) ? "..." : "Borrar"}
            </button>
          </li>
        ))}
      </ul>

      {/* Indicador de revalidación en background */}
      {revalidatingTodos && todos.length > 0 && (
        <div className="text-xs text-gray-400 mb-2">Actualizando lista...</div>
      )}


    </div>
  );
} 
// app/routes/projects.tsx

// Página para ver, eliminar y editar proyectos.
// Utiliza tRPC para obtener y modificar la lista de proyectos.

import { useEffect, useState } from "react";
import { useTodoProjectStore } from "~/utils/todoProjectStore";
import { NavLink } from "react-router";

export default function ProjectsPage() {
  // Usamos la store para obtener y manipular proyectos
  const {
    projects,
    loadingProjects,
    revalidatingProjects,
    errorProjects,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    setProjects, // Setter para hidratar Zustand
    fetchTodos,
  } = useTodoProjectStore();

  const [newProject, setNewProject] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [updatingProject, setUpdatingProject] = useState(false);
  const [deletingProjects, setDeletingProjects] = useState<Set<number>>(new Set());

  // Cargamos los proyectos al montar el componente
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.trim()) {
      setCreatingProject(true);
      try {
        await createProject(newProject.trim());
        setNewProject("");
      } catch (error) {
        console.error('Error al crear proyecto:', error);
      } finally {
        setCreatingProject(false);
      }
    }
  };

  const handleEditProject = (id: number, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && editingName.trim()) {
      setUpdatingProject(true);
      try {
        await updateProject(editingId, editingName.trim());
        setEditingId(null);
        setEditingName("");
      } catch (error) {
        console.error('Error al actualizar proyecto:', error);
      } finally {
        setUpdatingProject(false);
      }
    }
  };

  const handleDeleteProject = async (id: number) => {
    setDeletingProjects(prev => new Set(prev).add(id));
    try {
      await deleteProject(id);
    } catch (error) {
      console.error('Error al borrar proyecto:', error);
    } finally {
      setDeletingProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  if (errorProjects) return <div>Error al cargar proyectos: {errorProjects}</div>;

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Proyectos</h1>
      <form onSubmit={handleCreateProject} className="flex mb-4">
        <input
          type="text"
          value={newProject}
          onChange={(e) => setNewProject(e.target.value)}
          className="p-2 border flex-grow"
          placeholder="Añadir un nuevo proyecto..."
        />
        <button
          type="submit"
          className="p-2 ml-2 text-white bg-blue-500 disabled:bg-blue-300"
          disabled={creatingProject}
        >
          {creatingProject ? "Añadiendo..." : "Añadir"}
        </button>
      </form>

      {/* Mostramos el mensaje de cargando debajo del formulario, sin bloquear la página */}
      {loadingProjects && (
        <div className="mb-2 text-gray-500">Cargando proyectos...</div>
      )}

      <ul>
        {projects?.map((project) => (
          <li key={project.id} className="flex items-center justify-between p-2 border-b">
            <div className="flex items-center">
              <NavLink
                to={`/todos/${project.id}`}
                className="font-semibold hover:underline"
                onMouseEnter={() => fetchTodos(project.id)}
              >
                {project.name}
              </NavLink>
              {/* Botón para editar */}
              <button onClick={() => handleEditProject(project.id, project.name)} className="ml-2 text-xs text-yellow-600">Editar</button>
            </div>
            <button
              onClick={() => handleDeleteProject(project.id)}
              className="p-1 text-xs text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300"
              disabled={deletingProjects.has(project.id)}
            >
              {deletingProjects.has(project.id) ? "..." : "Borrar"}
            </button>
          </li>
        ))}
      </ul>

      {/* Indicador de revalidación en background */}
      {revalidatingProjects && projects.length > 0 && (
        <div className="text-xs text-gray-400 mb-2">Actualizando proyectos...</div>
      )}

      {/* Formulario de edición */}
      {editingId && (
        <form onSubmit={handleUpdateProject} className="flex mt-4">
          <input
            type="text"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            className="p-2 border flex-grow"
            placeholder="Nuevo nombre del proyecto..."
          />
          <button 
            type="submit" 
            className="p-2 ml-2 text-white bg-green-500 disabled:bg-green-300"
            disabled={updatingProject}
          >
            {updatingProject ? "Guardando..." : "Guardar"}
          </button>
          <button 
            type="button" 
            className="p-2 ml-2 text-white bg-gray-400 disabled:bg-gray-300" 
            onClick={() => { setEditingId(null); setEditingName(""); }}
            disabled={updatingProject}
          >
            Cancelar
          </button>
        </form>
      )}
    </div>
  );
}

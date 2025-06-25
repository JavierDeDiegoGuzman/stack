// app/utils/todoProjectStore.ts

// Store de Zustand para gestionar proyectos y todos usando tRPC.
// Ahora incluye persistencia en Local Storage para mostrar datos cacheados al refrescar la página.
// Al cerrar sesión, limpia el Local Storage para evitar fugas de datos entre usuarios.
// Proporciona un selector para obtener los todos de un proyecto específico.

import { create } from 'zustand';
// Importamos el middleware persistente de Zustand
import { persist } from 'zustand/middleware';
import { trpc } from '~/utils/trpc';
import type { Project, Todo } from '~/database/schema';

interface User {
  email: string;
}

interface TodoProjectStore {
  projects: Project[];
  allTodos: Todo[]; // Todos los todos cacheados globalmente
  loadingProjects: boolean;
  revalidatingProjects: boolean; // Revalidación en background para proyectos
  loadingTodos: boolean; // Loading inicial de todos
  revalidatingTodos: boolean; // Revalidación en background
  errorProjects?: string;
  errorTodos?: string;
  user: User | null; // Usuario autenticado
  loadingUser: boolean;
  errorUser?: string;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchTodos: (projectId: number) => Promise<void>;
  getTodosByProject: (projectId: number) => Todo[];
  createProject: (name: string) => Promise<void>;
  updateProject: (id: number, name: string) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  createTodo: (content: string, projectId: number) => Promise<void>;
  updateTodo: (id: number, completed: number) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
  setProjects: (projects: Project[]) => void;
  setTodosForProject: (projectId: number, todos: Todo[]) => void;
}

export const useTodoProjectStore = create<TodoProjectStore>()(
  // Usamos persist para guardar proyectos, todos y usuario en Local Storage
  persist(
    (set, get) => ({
      projects: [],
      allTodos: [],
      loadingProjects: false,
      revalidatingProjects: false,
      loadingTodos: false,
      revalidatingTodos: false,
      errorProjects: undefined,
      errorTodos: undefined,
      user: null,
      loadingUser: false,
      errorUser: undefined,

      // Login de usuario
      login: async (email, password) => {
        set({ loadingUser: true, errorUser: undefined });
        try {
          await trpc.auth.login.mutate({ email, password });
          // Tras login, fetch del usuario autenticado
          await get().fetchUser();
        } catch (e: any) {
          set({ errorUser: e.message || 'Error al iniciar sesión' });
          throw e;
        } finally {
          set({ loadingUser: false });
        }
      },
      // Registro de usuario
      register: async (email, password) => {
        set({ loadingUser: true, errorUser: undefined });
        try {
          await trpc.auth.register.mutate({ email, password });
          await get().fetchUser();
        } catch (e: any) {
          set({ errorUser: e.message || 'Error al registrar' });
          throw e;
        } finally {
          set({ loadingUser: false });
        }
      },
      // Logout de usuario
      logout: async () => {
        set({ loadingUser: true, errorUser: undefined });
        try {
          await trpc.auth.logout.mutate();
          set({ user: null, projects: [], allTodos: [] }); // Limpiamos el estado en memoria
          // Limpiamos el Local Storage del store
          if (typeof window !== 'undefined') {
            useTodoProjectStore.persist.clearStorage();
          }
        } catch (e: any) {
          set({ errorUser: e.message || 'Error al cerrar sesión' });
          throw e;
        } finally {
          set({ loadingUser: false });
        }
      },
      // Fetch del usuario autenticado (a implementar en el backend)
      fetchUser: async () => {
        try {
          const user = await trpc.auth.me.query();
          // Guardamos el usuario autenticado (o null si no hay sesión)
          set({ user });
        } catch (e: any) {
          set({ user: null });
        }
      },

      // Selector para obtener los todos de un proyecto específico desde el array global
      getTodosByProject: (projectId) => {
        return get().allTodos.filter(t => t.projectId === projectId);
      },

      // Obtiene la lista de proyectos desde tRPC, usando caché, localStorage y revalidando en background
      fetchProjects: async () => {
        const cachedProjects = get().projects;
        if (!cachedProjects || cachedProjects.length === 0) {
          // No hay proyectos en memoria, intentamos hidratar desde localStorage
          if (typeof window !== 'undefined') {
            const persisted = localStorage.getItem('todo-project-store');
            if (persisted) {
              try {
                const parsed = JSON.parse(persisted);
                if (parsed.state && parsed.state.projects && parsed.state.projects.length > 0) {
                  // Hidratamos el estado con los proyectos guardados
                  set({ projects: parsed.state.projects });
                }
              } catch (e) {
                // Si hay error al parsear, ignoramos y seguimos
              }
            }
          }
          set({ loadingProjects: true, errorProjects: undefined });
        } else {
          // Hay proyectos en caché, solo revalidamos en background
          set({ revalidatingProjects: true, errorProjects: undefined });
        }
        try {
          const projects = await trpc.todos.listProjects.query();
          set({
            projects,
            loadingProjects: false,
            revalidatingProjects: false,
          });
        } catch (e: any) {
          set({
            errorProjects: e.message,
            loadingProjects: false,
            revalidatingProjects: false,
          });
        }
      },

      // Obtiene los todos de un proyecto, usando caché, localStorage y revalidando en background
      fetchTodos: async (projectId: number) => {
        // Comprobamos si hay todos en caché para este proyecto
        const cachedTodos = get().allTodos.filter(t => t.projectId === projectId);
        if (cachedTodos.length === 0) {
          // No hay todos en memoria, intentamos hidratar desde localStorage
          if (typeof window !== 'undefined') {
            const persisted = localStorage.getItem('todo-project-store');
            if (persisted) {
              try {
                const parsed = JSON.parse(persisted);
                if (parsed.state && parsed.state.allTodos && Array.isArray(parsed.state.allTodos)) {
                  const todosFromStorage = parsed.state.allTodos.filter((t: any) => t.projectId === projectId);
                  if (todosFromStorage.length > 0) {
                    // Hidratamos el estado con los todos guardados para este proyecto
                    set(state => ({
                      allTodos: [
                        ...state.allTodos.filter(t => t.projectId !== projectId),
                        ...todosFromStorage
                      ]
                    }));
                  }
                }
              } catch (e) {
                // Si hay error al parsear, ignoramos y seguimos
              }
            }
          }
          set({ loadingTodos: true, errorTodos: undefined });
        } else {
          // Hay todos en caché, solo revalidamos en background
          set({ revalidatingTodos: true, errorTodos: undefined });
        }
        try {
          const todos = await trpc.todos.list.query({ projectId });
          set(state => ({
            allTodos: [
              ...state.allTodos.filter(t => t.projectId !== projectId),
              ...todos
            ],
            loadingTodos: false,
            revalidatingTodos: false
          }));
        } catch (e: any) {
          set({ errorTodos: e.message, loadingTodos: false, revalidatingTodos: false });
        }
      },

      // Crea un nuevo proyecto, lo añade localmente y luego revalida con el backend
      createProject: async (name: string) => {
        set({ revalidatingProjects: true });
        try {
          // Ahora el backend devuelve el proyecto creado
          const newProject = await trpc.todos.createProject.mutate({ name });
          // Añadimos el nuevo proyecto al array local inmediatamente
          set(state => ({
            projects: [...state.projects, newProject]
          }));
          // Revalidamos en background para mantener el orden y la consistencia
          const projects = await trpc.todos.listProjects.query();
          set({ projects });
        } catch (e: any) {
          console.error('Error en createProject:', e);
          throw e;
        } finally {
          set({ revalidatingProjects: false });
        }
      },

      // Edita el nombre de un proyecto y actualiza el array local tras la mutación, luego revalida en background
      updateProject: async (id: number, name: string) => {
        set({ revalidatingProjects: true });
        try {
          await trpc.todos.updateProject.mutate({ id, name });
          // Actualizamos el nombre localmente
          set(state => ({
            projects: state.projects.map(p => p.id === id ? { ...p, name } : p)
          }));
          // Revalidamos en background para mantener el orden y consistencia
          const projects = await trpc.todos.listProjects.query();
          set({ projects });
        } catch (e: any) {
          console.error('Error en updateProject:', e);
          throw e;
        } finally {
          set({ revalidatingProjects: false });
        }
      },

      // Borra un proyecto y actualiza el array local tras la mutación, luego revalida en background
      deleteProject: async (id: number) => {
        set({ revalidatingProjects: true });
        try {
          await trpc.todos.deleteProject.mutate({ id });
          // Eliminamos localmente
          set(state => ({
            projects: state.projects.filter(p => p.id !== id)
          }));
          // Revalidamos en background para mantener el orden y consistencia
          const projects = await trpc.todos.listProjects.query();
          set({ projects });
        } catch (e: any) {
          console.error('Error en deleteProject:', e);
          throw e;
        } finally {
          set({ revalidatingProjects: false });
        }
      },

      // Crea un nuevo todo, lo añade localmente y luego revalida con el backend
      createTodo: async (content: string, projectId: number) => {
        set({ revalidatingTodos: true });
        try {
          // Ahora el backend devuelve el todo creado
          const newTodo = await trpc.todos.create.mutate({ content, projectId });
          // Añadimos el nuevo todo al array local inmediatamente
          set(state => ({
            allTodos: [...state.allTodos, newTodo]
          }));
          // Revalidamos en background para mantener el orden y la consistencia
          const todos = await trpc.todos.list.query({ projectId });
          set(state => ({
            allTodos: [
              ...state.allTodos.filter(t => t.projectId !== projectId),
              ...todos
            ]
          }));
        } catch (e: any) {
          console.error('Error en createTodo:', e);
          throw e;
        } finally {
          set({ revalidatingTodos: false });
        }
      },

      // Actualiza un todo localmente tras la mutación, luego revalida en background
      updateTodo: async (id: number, completed: number) => {
        const todo = get().allTodos.find(t => t.id === id);
        if (!todo) return;
        set({ revalidatingTodos: true });
        try {
          await trpc.todos.update.mutate({ id, completed });
          // Actualizamos el todo localmente
          set(state => ({
            allTodos: state.allTodos.map(t => t.id === id ? { ...t, completed } : t)
          }));
          // Revalidamos en background para mantener el orden y consistencia
          const todos = await trpc.todos.list.query({ projectId: todo.projectId });
          set(state => ({
            allTodos: [
              ...state.allTodos.filter(t => t.projectId !== todo.projectId),
              ...todos
            ]
          }));
        } catch (e: any) {
          console.error('Error en updateTodo:', e);
          throw e;
        } finally {
          set({ revalidatingTodos: false });
        }
      },

      // Borra un todo localmente tras la mutación, luego revalida en background
      deleteTodo: async (id: number) => {
        const todo = get().allTodos.find(t => t.id === id);
        if (!todo) return;
        set({ revalidatingTodos: true });
        try {
          await trpc.todos.delete.mutate({ id });
          // Eliminamos el todo localmente
          set(state => ({
            allTodos: state.allTodos.filter(t => t.id !== id)
          }));
          // Revalidamos en background para mantener el orden y consistencia
          const todos = await trpc.todos.list.query({ projectId: todo.projectId });
          set(state => ({
            allTodos: [
              ...state.allTodos.filter(t => t.projectId !== todo.projectId),
              ...todos
            ]
          }));
        } catch (e: any) {
          console.error('Error en deleteTodo:', e);
          throw e;
        } finally {
          set({ revalidatingTodos: false });
        }
      },

      // Setter para hidratar proyectos desde SSR
      setProjects: (projects: Project[]) => set({ projects }),
      // Setter para hidratar todos de un proyecto desde SSR
      setTodosForProject: (projectId: number, todos: Todo[]) => set(state => ({
        allTodos: [
          ...state.allTodos.filter(t => t.projectId !== projectId),
          ...todos
        ]
      })),
    }),
    {
      name: 'todo-project-store', // Nombre de la clave en localStorage
      // Solo persistimos los datos relevantes (proyectos, todos y usuario)
      partialize: (state) => ({
        projects: state.projects,
        allTodos: state.allTodos,
        user: state.user,
      }),
      // Puedes usar storage: sessionStorage si prefieres sesión en vez de local
    }
  )
); 
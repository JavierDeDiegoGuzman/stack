// app/utils/todoProjectStore.ts

// Store de Zustand para gestionar proyectos y todos usando tRPC.
// Ahora incluye un sistema de caché global de todos, permitiendo mostrar datos cacheados y revalidar en background.
// Proporciona un selector para obtener los todos de un proyecto específico.

import { create } from 'zustand';
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

export const useTodoProjectStore = create<TodoProjectStore>((set, get) => ({
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
      set({ user: null });
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

  // Obtiene la lista de proyectos desde tRPC, usando caché y revalidando en background
  fetchProjects: async () => {
    const cachedProjects = get().projects;
    if (!cachedProjects || cachedProjects.length === 0) {
      // No hay proyectos en caché, mostramos loading inicial
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

  // Obtiene los todos de un proyecto, usando caché y revalidando en background
  fetchTodos: async (projectId: number) => {
    // Comprobamos si hay todos en caché para este proyecto
    const cachedTodos = get().allTodos.filter(t => t.projectId === projectId);
    if (cachedTodos.length === 0) {
      // No hay todos en caché, mostramos loading inicial
      set({ loadingTodos: true, errorTodos: undefined });
    } else {
      // Hay todos en caché, solo revalidamos en background
      set({ revalidatingTodos: true, errorTodos: undefined });
    }
    try {
      const todos = await trpc.todos.list.query({ projectId });
      set(state => ({
        allTodos: [
          // Todos los todos que NO son de este proyecto
          ...state.allTodos.filter(t => t.projectId !== projectId),
          // Los nuevos todos de este proyecto
          ...todos
        ],
        loadingTodos: false,
        revalidatingTodos: false
      }));
    } catch (e: any) {
      set({ errorTodos: e.message, loadingTodos: false, revalidatingTodos: false });
    }
  },

  // Crea un nuevo proyecto y revalida el array mostrando revalidación
  createProject: async (name: string) => {
    set({ revalidatingProjects: true });
    try {
      await trpc.todos.createProject.mutate({ name });
      const projects = await trpc.todos.listProjects.query();
      set({ projects });
    } catch (e: any) {
      console.error('Error en createProject:', e);
      throw e; // Re-lanzamos el error para que el componente lo maneje
    } finally {
      set({ revalidatingProjects: false });
    }
  },

  // Edita el nombre de un proyecto y revalida el array mostrando revalidación
  updateProject: async (id: number, name: string) => {
    set({ revalidatingProjects: true });
    try {
      await trpc.todos.updateProject.mutate({ id, name });
      const projects = await trpc.todos.listProjects.query();
      set({ projects });
    } catch (e: any) {
      console.error('Error en updateProject:', e);
      throw e;
    } finally {
      set({ revalidatingProjects: false });
    }
  },

  // Borra un proyecto y revalida el array mostrando revalidación
  deleteProject: async (id: number) => {
    set({ revalidatingProjects: true });
    try {
      await trpc.todos.deleteProject.mutate({ id });
      const projects = await trpc.todos.listProjects.query();
      set({ projects });
    } catch (e: any) {
      console.error('Error en deleteProject:', e);
      throw e;
    } finally {
      set({ revalidatingProjects: false });
    }
  },

  // Crea un nuevo todo en un proyecto y actualiza el array global mostrando revalidación
  createTodo: async (content: string, projectId: number) => {
    set({ revalidatingTodos: true });
    try {
      await trpc.todos.create.mutate({ content, projectId });
      // Refrescar la lista de todos de ese proyecto en el array global
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

  // Actualiza el estado de un todo y refresca el array global mostrando revalidación
  updateTodo: async (id: number, completed: number) => {
    const todo = get().allTodos.find(t => t.id === id);
    if (!todo) return;
    set({ revalidatingTodos: true });
    try {
      await trpc.todos.update.mutate({ id, completed });
      // Refrescar la lista de todos de ese proyecto en el array global
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

  // Borra un todo y refresca el array global mostrando revalidación
  deleteTodo: async (id: number) => {
    const todo = get().allTodos.find(t => t.id === id);
    if (!todo) return;
    set({ revalidatingTodos: true });
    try {
      await trpc.todos.delete.mutate({ id });
      // Refrescar la lista de todos de ese proyecto en el array global
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
})); 
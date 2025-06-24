import { todos, projects } from '~/database/schema';
import { z } from 'zod';
import { publicProcedure, router } from './../trpc';
import { eq, and } from 'drizzle-orm';

export const todoRouter = router({
  list: publicProcedure.input(z.object({ projectId: z.number() })).query(async ({ ctx, input }) => {
    console.log('[todos.list] ctx.user:', ctx.user);
    console.log('[todos.list] input:', input);
    if (!ctx.db) {
      console.log('[todos.list] No db');
      throw new Error('Database context not available');
    }
    if (!ctx.user) {
      console.log('[todos.list] No autenticado');
      throw new Error('No autenticado');
    }
    const todoList = await ctx.db
      .select()
      .from(todos)
      .where(and(eq(todos.projectId, input.projectId), eq(todos.userId, ctx.user.id)))
      .orderBy(todos.id);
    console.log('[todos.list] resultado:', todoList);
    return todoList;
  }),

  create: publicProcedure
    .input(z.object({ content: z.string().min(1), projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      console.log('[todos.create] ctx.user:', ctx.user);
      console.log('[todos.create] input:', input);
      if (!ctx.db) throw new Error('Database not available');
      if (!ctx.user) throw new Error('No autenticado');
      await ctx.db.insert(todos).values({ content: input.content, projectId: input.projectId, userId: ctx.user.id });
      return true;
    }),

  update: publicProcedure
    .input(z.object({ id: z.number(), completed: z.number().min(0).max(1) }))
    .mutation(async ({ ctx, input }) => {
      console.log('[todos.update] ctx.user:', ctx.user);
      console.log('[todos.update] input:', input);
      if (!ctx.db) throw new Error('Database not available');
      if (!ctx.user) throw new Error('No autenticado');
      await ctx.db
        .update(todos)
        .set({ completed: input.completed })
        .where(and(eq(todos.id, input.id), eq(todos.userId, ctx.user.id)));
      return true;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      console.log('[todos.delete] ctx.user:', ctx.user);
      console.log('[todos.delete] input:', input);
      if (!ctx.db) throw new Error('Database not available');
      if (!ctx.user) throw new Error('No autenticado');
      await ctx.db.delete(todos).where(and(eq(todos.id, input.id), eq(todos.userId, ctx.user.id)));
      return true;
    }),

  listProjects: publicProcedure.query(async ({ ctx }) => {
    console.log('[todos.listProjects] ctx.user:', ctx.user);
    if (!ctx.db) throw new Error('Database not available');
    if (!ctx.user) throw new Error('No autenticado');
    const projectList = await ctx.db.select().from(projects).where(eq(projects.userId, ctx.user.id)).orderBy(projects.id);
    console.log('[todos.listProjects] resultado:', projectList);
    return projectList;
  }),

  createProject: publicProcedure.input(z.object({ name: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    console.log('[todos.createProject] ctx.user:', ctx.user);
    console.log('[todos.createProject] input:', input);
    if (!ctx.db) throw new Error('Database not available');
    if (!ctx.user) throw new Error('No autenticado');
    await ctx.db.insert(projects).values({ name: input.name, userId: ctx.user.id });
    return true;
  }),

  deleteProject: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    console.log('[todos.deleteProject] ctx.user:', ctx.user);
    console.log('[todos.deleteProject] input:', input);
    if (!ctx.db) throw new Error('Database not available');
    if (!ctx.user) throw new Error('No autenticado');
    await ctx.db.delete(projects).where(and(eq(projects.id, input.id), eq(projects.userId, ctx.user.id)));
    return true;
  }),

  updateProject: publicProcedure.input(z.object({ id: z.number(), name: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    console.log('[todos.updateProject] ctx.user:', ctx.user);
    console.log('[todos.updateProject] input:', input);
    if (!ctx.db) throw new Error('Database not available');
    if (!ctx.user) throw new Error('No autenticado');
    await ctx.db.update(projects).set({ name: input.name }).where(and(eq(projects.id, input.id), eq(projects.userId, ctx.user.id)));
    return true;
  }),
});
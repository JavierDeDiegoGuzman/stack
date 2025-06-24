import { todos, projects } from '~/database/schema';
import { z } from 'zod';
import { publicProcedure, router } from './../trpc';
import { eq, and } from 'drizzle-orm';

export const todoRouter = router({
  list: publicProcedure.input(z.object({ projectId: z.number() })).query(async ({ ctx, input }) => {
    if (!ctx.db) {
      throw new Error('Database context not available');
    }
    if (!ctx.user) {
      throw new Error('No autenticado');
    }
    const todoList = await ctx.db
      .select()
      .from(todos)
      .where(and(eq(todos.projectId, input.projectId), eq(todos.userId, ctx.user.id)))
      .orderBy(todos.id);
    return todoList;
  }),

  create: publicProcedure
    .input(z.object({ content: z.string().min(1), projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) throw new Error('Database not available');
      if (!ctx.user) throw new Error('No autenticado');
      const inserted = await ctx.db
        .insert(todos)
        .values({ content: input.content, projectId: input.projectId, userId: ctx.user.id })
        .returning();
      return inserted[0];
    }),

  update: publicProcedure
    .input(z.object({ id: z.number(), completed: z.number().min(0).max(1) }))
    .mutation(async ({ ctx, input }) => {
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
      if (!ctx.db) throw new Error('Database not available');
      if (!ctx.user) throw new Error('No autenticado');
      await ctx.db.delete(todos).where(and(eq(todos.id, input.id), eq(todos.userId, ctx.user.id)));
      return true;
    }),

  listProjects: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.db) throw new Error('Database not available');
    if (!ctx.user) throw new Error('No autenticado');
    const projectList = await ctx.db.select().from(projects).where(eq(projects.userId, ctx.user.id)).orderBy(projects.id);
    return projectList;
  }),

  createProject: publicProcedure.input(z.object({ name: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    if (!ctx.db) throw new Error('Database not available');
    if (!ctx.user) throw new Error('No autenticado');
    const inserted = await ctx.db
      .insert(projects)
      .values({ name: input.name, userId: ctx.user.id })
      .returning();
    return inserted[0];
  }),

  deleteProject: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    if (!ctx.db) throw new Error('Database not available');
    if (!ctx.user) throw new Error('No autenticado');
    await ctx.db.delete(projects).where(and(eq(projects.id, input.id), eq(projects.userId, ctx.user.id)));
    return true;
  }),

  updateProject: publicProcedure.input(z.object({ id: z.number(), name: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    if (!ctx.db) throw new Error('Database not available');
    if (!ctx.user) throw new Error('No autenticado');
    await ctx.db.update(projects).set({ name: input.name }).where(and(eq(projects.id, input.id), eq(projects.userId, ctx.user.id)));
    return true;
  }),
});
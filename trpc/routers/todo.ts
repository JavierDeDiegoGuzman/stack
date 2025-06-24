import { todos, projects } from '~/database/schema';
import { z } from 'zod';
import { publicProcedure, router } from './../trpc';
import { eq } from 'drizzle-orm';

export const todoRouter = router({
  list: publicProcedure.input(z.object({ projectId: z.number() })).query(async ({ ctx, input }) => {
    if (!ctx.db) {
      throw new Error('Database context not available');
    }
    const todoList = await ctx.db.select().from(todos).where(eq(todos.projectId, input.projectId)).orderBy(todos.id);
    return todoList;
  }),

  create: publicProcedure
    .input(z.object({ content: z.string().min(1), projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) throw new Error('Database not available');
      await ctx.db.insert(todos).values({ content: input.content, projectId: input.projectId });
      return true;
    }),

  update: publicProcedure
    .input(z.object({ id: z.number(), completed: z.number().min(0).max(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) throw new Error('Database not available');
      await ctx.db
        .update(todos)
        .set({ completed: input.completed })
        .where(eq(todos.id, input.id));
      return true;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) throw new Error('Database not available');
      await ctx.db.delete(todos).where(eq(todos.id, input.id));
      return true;
    }),

  listProjects: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.db) throw new Error('Database not available');
    const projectList = await ctx.db.select().from(projects).orderBy(projects.id);
    return projectList;
  }),

  createProject: publicProcedure.input(z.object({ name: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    if (!ctx.db) throw new Error('Database not available');
    await ctx.db.insert(projects).values({ name: input.name });
    return true;
  }),

  deleteProject: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    if (!ctx.db) throw new Error('Database not available');
    await ctx.db.delete(projects).where(eq(projects.id, input.id));
    return true;
  }),

  updateProject: publicProcedure.input(z.object({ id: z.number(), name: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    if (!ctx.db) throw new Error('Database not available');
    await ctx.db.update(projects).set({ name: input.name }).where(eq(projects.id, input.id));
    return true;
  }),
});
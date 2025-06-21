// trpc/router.ts

// Este archivo define el router principal de tu aplicación.
// Puedes pensar en él como el punto de entrada de tu API, donde defines todas las rutas.
// Para empezar, hemos añadido un procedimiento de ejemplo.

import { z } from 'zod';
import { publicProcedure, router } from './trpc';
import { todos } from '~/database/schema';
import { eq } from 'drizzle-orm';

const todoRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.db) {
      throw new Error('Database context not available');
    }
    const todoList = await ctx.db.select().from(todos).orderBy(todos.id);
    return todoList;
  }),

  create: publicProcedure
    .input(z.object({ content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) throw new Error('Database not available');
      await ctx.db.insert(todos).values({ content: input.content });
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
});

export const appRouter = router({
  greeting: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
      })
    )
    .query(({ input, ctx }) => {
      // Aquí podrías usar ctx.db para interactuar con la base de datos
      return `¡Hola, ${input.name ?? 'mundo'} desde tRPC!`;
    }),
  // Aquí puedes añadir más rutas anidando routers.
  todos: todoRouter,
});

// Exporta el tipo del router. Lo necesitarás en el cliente.
export type AppRouter = typeof appRouter; 
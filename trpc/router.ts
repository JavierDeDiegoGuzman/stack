// trpc/router.ts

// Este archivo define el router principal de tu aplicación.
// Puedes pensar en él como el punto de entrada de tu API, donde defines todas las rutas.
// Para empezar, hemos añadido un procedimiento de ejemplo.

import { z } from 'zod';
import { publicProcedure, router } from './trpc';
import { todoRouter } from './routers/todo';
import { cookieRouter } from './routers/cookie';
import { authRouter } from './routers/auth';


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
  cookies: cookieRouter,
  auth: authRouter,
});

// Exporta el tipo del router. Lo necesitarás en el cliente.
export type AppRouter = typeof appRouter; 
// trpc/routers/cookie.ts

// Este router permite ver, añadir y eliminar cookies desde tRPC.
// Útil para gestionar autenticación o preferencias del usuario desde el cliente.

import { z } from 'zod';
import { publicProcedure, router } from './../trpc';
import type { Request, Response } from 'express';

// Definimos el tipo de contexto esperado para acceder a req y res
interface CookieContext {
  req: Request;
  res: Response;
  db?: unknown;
}

export const cookieRouter = router({
  // Obtiene todas las cookies del usuario
  list: publicProcedure.query(({ ctx }) => {
    const { req } = ctx as CookieContext;
    // Devuelve todas las cookies disponibles en la petición
    return req.cookies;
  }),

  // Añade o edita una cookie
  set: publicProcedure.input(z.object({
    name: z.string(),
    value: z.string(),
    options: z.object({
      httpOnly: z.boolean().optional(),
      secure: z.boolean().optional(),
      sameSite: z.enum(['lax', 'strict', 'none']).optional(),
      maxAge: z.number().optional(),
      path: z.string().optional(),
    }).optional(),
  })).mutation(({ ctx, input }) => {
    const { res } = ctx as CookieContext;
    // Añade o edita la cookie usando res.cookie
    res.cookie(input.name, input.value, input.options ?? {});
    return { ok: true };
  }),

  // Elimina una cookie
  delete: publicProcedure.input(z.object({
    name: z.string(),
    options: z.object({
      path: z.string().optional(),
    }).optional(),
  })).mutation(({ ctx, input }) => {
    const { res } = ctx as CookieContext;
    // Elimina la cookie usando res.clearCookie
    res.clearCookie(input.name, input.options ?? {});
    return { ok: true };
  }),
}); 
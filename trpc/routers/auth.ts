// trpc/routers/auth.ts

// Router para autenticación de usuarios usando JWT en cookies.
// Permite registrar, hacer login y logout.

import { z } from 'zod';
import { publicProcedure, router } from './../trpc';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { users } from '~/database/schema';
import { eq } from 'drizzle-orm';

// Clave secreta para firmar los JWT (en producción usa variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const authRouter = router({
  // Registro de usuario
  register: publicProcedure.input(z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })).mutation(async ({ ctx, input }) => {
    if (!ctx.db) throw new Error('Database not available');
    const existing = await ctx.db.select().from(users).where(eq(users.email, input.email));
    if (existing.length > 0) {
      throw new Error('El usuario ya existe');
    }
    await ctx.db.insert(users).values({ email: input.email, password: input.password });
    return { ok: true };
  }),

  // Login de usuario
  login: publicProcedure.input(z.object({
    email: z.string().email(),
    password: z.string(),
  })).mutation(async ({ ctx, input }) => {
    if (!ctx.db) throw new Error('Database not available');
    const user = await ctx.db.select().from(users).where(eq(users.email, input.email));
    if (!user[0] || user[0].password !== input.password) {
      throw new Error('Credenciales incorrectas');
    }
    // Genera un JWT
    const token = jwt.sign({ userId: user[0].id, email: user[0].email }, JWT_SECRET, { expiresIn: '7d' });
    // Guarda el JWT en una cookie
    (ctx.res as Response).cookie('auth_token', token, { httpOnly: true, sameSite: 'lax' });
    return { ok: true };
  }),

  // Logout de usuario
  logout: publicProcedure.mutation(({ ctx }) => {
    (ctx.res as Response).clearCookie('auth_token');
    return { ok: true };
  }),

  // Endpoint para obtener el usuario autenticado actual
  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.db) return null;
    const req = ctx.req as Request;
    const token = req.cookies['auth_token'];
    if (!token) return null;
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
      // Busca el usuario en la base de datos
      const user = await ctx.db.select().from(users).where(eq(users.id, payload.userId));
      if (!user[0]) return null;
      return { id: user[0].id, email: user[0].email };
    } catch {
      return null;
    }
  }),
}); 
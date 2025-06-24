// trpc/context.ts

// Este archivo define el contexto del lado del servidor para las peticiones entrantes.
// Se utiliza para pasar a los procedimientos tRPC elementos que la mayoría necesita,
// como la sesión del usuario, la conexión a la base de datos, etc.

import * as trpcExpress from '@trpc/server/adapters/express';
import { DatabaseContext } from '~/database/context';
import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '~/database/schema';
import jwt from 'jsonwebtoken';
import { users } from '~/database/schema';
import { eq } from 'drizzle-orm';

// Creamos un tipo explícito para la base de datos para mayor claridad.
type DbType = PostgresJsDatabase<typeof schema>;

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Ahora el contexto incluye db, req y res para poder manipular cookies y cabeceras.
export const createContext = async ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
  // Obtenemos la base de datos del contexto de base de datos que ya tienes configurado.
  const db = DatabaseContext.getStore() as DbType | null;
  let user = null;
  if (db && req.cookies['auth_token']) {
    try {
      const payload = jwt.verify(req.cookies['auth_token'], JWT_SECRET) as { userId: number; email: string };
      const found = await db.select().from(users).where(eq(users.id, payload.userId));
      if (found[0]) {
        user = { id: found[0].id, email: found[0].email };
      }
    } catch {}
  }

  // Devolvemos también req y res para poder manipular cookies en los routers tRPC.
  return {
    db,
    req,
    res,
    user,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>; 
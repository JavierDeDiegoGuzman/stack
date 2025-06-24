// trpc/context.ts

// Este archivo define el contexto del lado del servidor para las peticiones entrantes.
// Se utiliza para pasar a los procedimientos tRPC elementos que la mayoría necesita,
// como la sesión del usuario, la conexión a la base de datos, etc.

import * as trpcExpress from '@trpc/server/adapters/express';
import { DatabaseContext } from '~/database/context';
import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '~/database/schema';

// Creamos un tipo explícito para la base de datos para mayor claridad.
type DbType = PostgresJsDatabase<typeof schema>;

// Ahora el contexto incluye db, req y res para poder manipular cookies y cabeceras.
export const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
  // Obtenemos la base de datos del contexto de base de datos que ya tienes configurado.
  const db = DatabaseContext.getStore() as DbType | null;

  // Devolvemos también req y res para poder manipular cookies en los routers tRPC.
  return {
    db,
    req,
    res,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>; 
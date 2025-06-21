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

// Definimos la forma de nuestro contexto.
interface CreateContextOptions {
  db: DbType | null;
}

/**
 * Crea el contexto interno para una petición.
 * Aquí es donde transformarías la petición (req) en algo útil para tus resolvers.
 * @internal
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    db: opts.db,
  };
};

/**
 * Esta es la función que se ejecuta para cada petición que llega al servidor.
 * Proporciona el contexto a tus procedimientos tRPC.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
  // Obtenemos la base de datos del contexto de base de datos que ya tienes configurado.
  const db = DatabaseContext.getStore() as DbType | null;

  // Pasamos la base de datos al contexto interno.
  return createInnerTRPCContext({
    db,
  });
};

export type Context = Awaited<ReturnType<typeof createContext>>; 
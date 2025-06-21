// trpc/trpc.ts

// Este archivo es el punto de entrada para construir tu API tRPC.
// Exporta los bloques de construcción reutilizables que usarás para definir tu API.

import { initTRPC } from '@trpc/server';
import { type Context } from './context';

const t = initTRPC.context<Context>().create();

/**
 * Este es el router principal de tu aplicación.
 * Todos los demás routers deben fusionarse en este.
 * @see https://trpc.io/docs/server/routers
 */
export const router = t.router;

/**
 * Este es el procedimiento base para crear nuevas rutas en tu API.
 * Es público, lo que significa que no requiere autenticación.
 * @see https://trpc.io/docs/server/procedures
 */
export const publicProcedure = t.procedure; 
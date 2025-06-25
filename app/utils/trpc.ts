//import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink, type TRPCClient } from '@trpc/client';
import type { AppRouter } from '../../trpc/router';

// Obtenemos la URL base de la API desde variable de entorno o por defecto localhost
//export const trpc = createTRPCReact<AppRouter>(); 

// Cliente clásico de tRPC para usar fuera de React
// Permite realizar queries y mutaciones desde stores, utilidades, etc.
export const trpc: TRPCClient<AppRouter> = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/trpc",
    }),
  ],
});


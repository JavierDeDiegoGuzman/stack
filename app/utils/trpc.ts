//import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink, type TRPCClient } from '@trpc/client';
import type { AppRouter } from '../../trpc/router';

//export const trpc = createTRPCReact<AppRouter>(); 

// Cliente clásico de tRPC para usar fuera de React
// Permite realizar queries y mutaciones desde stores, utilidades, etc.
export const trpc: TRPCClient<AppRouter> = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});


// app/utils/trpcServer.ts
// Helper para usar tRPC desde el servidor (SSR/loaders)
// Permite hacer queries a tRPC desde Node.js, por ejemplo en los loaders de React Router.

import { createTRPCProxyClient, httpBatchLink, type TRPCClient } from '@trpc/client';
import type { AppRouter } from '../../trpc/router';

export const trpcServer:TRPCClient<AppRouter> = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
}); 
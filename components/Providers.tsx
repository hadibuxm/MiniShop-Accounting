'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

let queryClient: QueryClient | undefined;
function getQueryClient(): QueryClient {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: 0, refetchOnWindowFocus: false } },
    });
  }
  return queryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(getQueryClient);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <CacheProvider>
        <ChakraProvider>
          <Authenticator.Provider>{children}</Authenticator.Provider>
        </ChakraProvider>
      </CacheProvider>
    </QueryClientProvider>
  );
}

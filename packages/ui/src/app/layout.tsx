'use client';

import AppHeader from '@/components/ui/header';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USERPOOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_USERPOOL_CLIENT_ID!,
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Authenticator>
          <AppHeader></AppHeader>

          <Suspense>
            <Providers>{children}</Providers>
          </Suspense>
        </Authenticator>
      </body>
    </html>
  );
}

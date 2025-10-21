"use client";
import "./globals.css";
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import queryClient from '@/lib/query/queryClient';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cn">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}

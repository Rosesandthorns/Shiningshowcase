
import type { Metadata } from 'next';
import { ThemeProvider } from "next-themes";
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { UserProvider } from '@/firebase/auth/use-user';

export const metadata: Metadata = {
  title: "Shining Showcase",
  description: 'Track, view, and analyze your shiny Pokémon collection!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/RSP-Icon.png" type="image/png" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <FirebaseClientProvider>
            <UserProvider>
              {children}
              <Toaster />
            </UserProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

    
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Header } from '@/components/Header';

export default function NotFound() {
  const pathname = usePathname();
  const { user, loading } = useUser();

  useEffect(() => {
    console.groupCollapsed(`[404 Diagnostic Info] - ${new Date().toISOString()}`);
    console.log('Page Not Found. Capturing diagnostic data...');
    console.log('Requested Path:', pathname);
    console.log('Auth Loading:', loading);
    if (!loading) {
        if (user) {
            console.log('User UID:', user.uid);
            console.log('User Display Name:', user.displayName);
            console.log('User Email:', user.email);
        } else {
            console.log('User: Not authenticated.');
        }
    }
    console.groupEnd();
  }, [pathname, user, loading]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
             <Card className="w-full max-w-lg text-center shadow-lg">
                <CardHeader>
                    <CardTitle className="text-4xl font-bold">404 - Page Not Found</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground pt-2">
                        The resource you tried to access could not be found.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <p className="text-sm text-muted-foreground">
                        We've logged diagnostic information to the browser console to help resolve this issue.
                   </p>
                    <div className="bg-muted p-3 rounded-md text-left text-sm font-mono overflow-x-auto">
                        <p>
                            <span className="font-semibold">Path:</span> {pathname}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/">Return to Home</Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
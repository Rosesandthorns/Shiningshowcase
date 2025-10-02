
"use client";

import { useUser } from '@/firebase';
import { Header } from '@/components/Header';
import { ListTab } from '@/components/tabs/ListTab';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ListPage() {
    const { user, loading } = useUser();

     if (loading) {
        return (
             <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </main>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
                    <Card className="w-full max-w-md text-center shadow-lg">
                        <CardHeader>
                            <CardTitle>Access Your Collection</CardTitle>
                            <CardDescription>You need to be signed in to view your Pokémon list.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/login">Sign In</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <ListTab />
            <footer className="py-6 text-center text-muted-foreground text-sm">
                © 2025 Rosie. All rights reserved.
            </footer>
        </div>
    );
}

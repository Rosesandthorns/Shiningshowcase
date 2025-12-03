'use client';

import { useUser } from '@/firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export function Dashboard() {
  const { user } = useUser();

  return (
    <main className="flex-1 container mx-auto p-4 md:p-6">
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground mb-4">
          Welcome back, {user?.displayName || 'Trainer'}!
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
          This is your personal dashboard. More features coming soon!
        </p>
      </section>

      <section className="my-12">
         <Card>
            <CardHeader>
                <CardTitle>Dashboard Content</CardTitle>
                <CardDescription>This area will soon be filled with personalized stats and updates about your collection.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Stay tuned for more information!</p>
            </CardContent>
        </Card>
      </section>
    </main>
  );
}

'use client';

import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaderboardClient } from '@/components/client/LeaderboardClient';
import { ChangelogClient } from '@/components/client/ChangelogClient';

export default function CommunityPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-6">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground mb-2">
                        Community Hub
                    </h1>
                    <p className="text-lg text-muted-foreground">Leaderboards, changelogs, and more.</p>
                </div>

                <Tabs defaultValue="leaderboard" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                        <TabsTrigger value="changelog">Changelog</TabsTrigger>
                    </TabsList>
                    <TabsContent value="leaderboard">
                       <LeaderboardClient />
                    </TabsContent>
                    <TabsContent value="changelog">
                        <ChangelogClient />
                    </TabsContent>
                </Tabs>
            </main>
             <footer className="py-6 text-center text-muted-foreground text-sm">
                © 2025 Rosie. All rights reserved.
            </footer>
        </div>
    );
}
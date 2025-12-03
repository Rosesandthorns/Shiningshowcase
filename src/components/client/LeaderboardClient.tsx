'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LeaderboardClient() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>Top shiny hunters on the platform. More rankings coming soon!</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-center items-center h-48 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Leaderboard coming soon!</p>
                </div>
            </CardContent>
        </Card>
    );
}
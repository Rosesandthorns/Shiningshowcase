
import { Header } from '@/components/Header';
import { AnalyticsTab } from '@/components/tabs/AnalyticsTab';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Analytics Dashboard - Rosie's Shiny Pokémon",
    description: 'Analyze your shiny Pokémon collection with detailed statistics and charts.',
};

export default async function AnalyticsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <AnalyticsTab />
             <footer className="py-6 text-center text-muted-foreground text-sm">
                © 2025 Rosie. All rights reserved.
            </footer>
        </div>
    );
}

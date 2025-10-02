
import { Header } from '@/components/Header';
import { ListTab } from '@/components/tabs/ListTab';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "National Pokédex - Rosie's Shiny Pokémon",
    description: 'Browse all Pokémon and see your collection progress.',
};

export default async function ListPage() {
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

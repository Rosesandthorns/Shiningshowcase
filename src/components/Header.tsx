import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold font-headline flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Sparkles className="h-7 w-7" />
          Rosie's Shiny Pokémon
        </Link>
        {/* Navigation items can be added here if needed */}
      </div>
    </header>
  );
}

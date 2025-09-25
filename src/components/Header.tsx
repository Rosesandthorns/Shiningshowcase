
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl md:text-2xl font-bold font-headline flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Sparkles className="h-7 w-7" />
          Rosie's Shiny Pokémon
        </Link>
        <nav className="flex items-center gap-2 md:gap-4">
          <Link href="/" className="text-sm md:text-base hover:underline">Home</Link>
          <Link href="/list" className="text-sm md:text-base hover:underline">List</Link>
          <Link href="/analytics" className="text-sm md:text-base hover:underline">Analytics</Link>
          <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base hover:underline">Others</a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

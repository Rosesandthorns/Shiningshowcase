
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ChevronDown, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { signInWithGoogle, signOutUser } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async () => {
    // We don't get the user back immediately with redirect
    // The onAuthStateChanged listener will handle the UI update.
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await signOutUser();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl md:text-2xl font-bold font-headline flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Image src="/images/RSP-Icon.png" alt="Rosie's Shiny Pokémon Logo" width={28} height={28} className="h-7 w-7" />
          Rosie's Shiny Pokémon
        </Link>
        <nav className="flex items-center gap-2 md:gap-4">
          <Link href="/" className="text-sm md:text-base hover:underline">Home</Link>
          <Link href="/list" className="text-sm md:text-base hover:underline">List</Link>
          <Link href="/analytics" className="text-sm md:text-base hover:underline">Analytics</Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm md:text-base hover:underline outline-none">
              Others
              <ChevronDown className="h-4 w-4 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {user && (
                <DropdownMenuItem asChild>
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/search">Search</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user ? (
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleSignIn}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}


"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ChevronDown, LogIn, LogOut, LayoutList, BarChart2, Target, UserSearch } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
       console.error("Error during sign out:", error);
       toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: "Could not sign you out. Please try again.",
      });
    }
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl md:text-2xl font-bold font-headline flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Image src="/images/RSP-Icon.png" alt="Shining Showcase Logo" width={28} height={28} className="h-7 w-7" />
          Shining Showcase
        </Link>
        <nav className="flex items-center gap-2 md:gap-4">
          <Link href="/" className="text-sm md:text-base hover:underline">Home</Link>
          {!loading && user && (
            <>
              <Link href="/hunts" className="text-sm md:text-base hover:underline hidden md:inline">Hunts</Link>
            </>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm md:text-base hover:underline outline-none">
              More
              <ChevronDown className="h-4 w-4 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {!loading && user && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">My Profile</Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild className="md:hidden">
                    <Link href="/hunts">
                      <Target className="mr-2 h-4 w-4" />
                      Hunts
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
               <DropdownMenuItem asChild>
                <Link href="/search">
                  <UserSearch className="mr-2 h-4 w-4" />
                  Search Users
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              {!loading && user ? (
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              ) : !loading ? (
                <DropdownMenuItem asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </DropdownMenuItem>
              ) : null }
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

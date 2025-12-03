'use client';

import { Header } from '@/components/Header';
import { HomeTab } from '@/components/tabs/HomeTab';
import { Dashboard } from '@/components/Dashboard';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { user, loading } = useUser();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 container mx-auto p-4 md:p-6">
          <Skeleton className="h-48 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    if (user) {
      return <Dashboard />;
    }

    return <HomeTab />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      {renderContent()}
      <footer className="py-6 text-center text-muted-foreground text-sm">
        © 2025 Rosie. All rights reserved.
      </footer>
    </div>
  );
}

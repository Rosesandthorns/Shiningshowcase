
import { Header } from '@/components/Header';
import { SearchClient } from '@/components/client/SearchClient';

export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <SearchClient />
      </main>
      <footer className="py-6 text-center text-muted-foreground text-sm">
        © 2025 Rosie. All rights reserved.
      </footer>
    </div>
  );
}


import { Header } from '@/components/Header';
import { HomeTab } from '@/components/tabs/HomeTab';

export default async function HomePage() {
  return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <HomeTab />
        <footer className="py-6 text-center text-muted-foreground text-sm">
          © 2025 Rosie. All rights reserved.
        </footer>
      </div>
  );
}

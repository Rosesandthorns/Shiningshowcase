
'use client';

import { useState, useEffect } from 'react';
import { type User } from 'firebase/auth';
import { type Firestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { NewHuntForm } from './NewHuntForm';
import { HuntCard } from './HuntCard';
import type { Hunt } from '@/types/hunts';

interface HuntsClientProps {
  user: User;
  firestore: Firestore;
}

export function HuntsClient({ user, firestore }: HuntsClientProps) {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const huntsRef = collection(firestore, 'users', user.uid, 'hunts');
    const q = query(huntsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const huntsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hunt));
      setHunts(huntsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching hunts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, user.uid]);

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">My Shiny Hunts</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              Start New Hunt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure New Shiny Hunt</DialogTitle>
            </DialogHeader>
            <NewHuntForm user={user} firestore={firestore} onHuntCreated={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {hunts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hunts.map(hunt => (
            <HuntCard key={hunt.id} hunt={hunt} firestore={firestore} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold text-muted-foreground">No active hunts</h2>
          <p className="text-muted-foreground mt-2">Click "Start New Hunt" to begin tracking!</p>
        </div>
      )}
    </div>
  );
}

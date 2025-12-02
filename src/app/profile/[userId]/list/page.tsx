
import { initializeFirebase } from '@/firebase';
import { Header } from '@/components/Header';
import { ListTab } from '@/components/tabs/ListTab';
import { getAllPokemon } from '@/lib/pokemonApi';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';

type ListPageProps = {
    params: {
        userId: string;
    };
};

// This is now a React Server Component
export default async function ListPage({ params }: ListPageProps) {
    const { firestore } = initializeFirebase();
    const profileUserId = params.userId;

    // 1. Validate user exists on the server
    const userDocRef = doc(firestore, 'users', profileUserId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        console.error(`[ListPage RSC] User not found for userId: ${profileUserId}`);
        notFound();
    }

    // 2. Fetch Pokémon data on the server
    const pokemon = await getAllPokemon(firestore, profileUserId);
    
    // 3. Render the page, passing server-fetched data to the client component
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            {/* ListTab is a client component that receives the initial data as props */}
            <ListTab pokemon={pokemon} userId={profileUserId} />
            <footer className="py-6 text-center text-muted-foreground text-sm">
                © 2025 Rosie. All rights reserved.
            </footer>
        </div>
    );
}

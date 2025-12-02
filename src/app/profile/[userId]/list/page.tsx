
import { initializeFirebase } from '@/firebase';
import { Header } from '@/components/Header';
import { ListTab } from '@/components/tabs/ListTab';
import { getAllPokemon, getUserProfile } from '@/lib/pokemonApi';
import { notFound } from 'next/navigation';

type ListPageProps = {
    params: {
        profileId: string;
    };
};

// This is a React Server Component. It fetches all necessary data on the server.
export default async function ListPage({ params }: ListPageProps) {
    const { firestore } = initializeFirebase();
    const profileUserId = params.profileId;

    // 1. Validate user exists on the server. If not, notFound() is called.
    try {
        const userProfile = await getUserProfile(firestore, profileUserId);
        if (!userProfile) {
            notFound();
        }
    } catch (error) {
        console.error(`[Server Page Error] Failed to fetch profile for list page: ${profileUserId}`, error);
        notFound();
    }

    // 2. Fetch all Pokémon for this user on the server.
    const pokemon = await getAllPokemon(firestore, profileUserId);
    
    // 3. Render the page, passing the server-fetched data to the client component.
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

'use client';

import { useFirestore, useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import type { ChangelogPost } from '@/types/changelog';
import { NewPostForm } from './NewPostForm';
import { ChangelogPostCard } from './ChangelogPostCard';
import { Skeleton } from '../ui/skeleton';

export function ChangelogClient() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [posts, setPosts] = useState<ChangelogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [userProfileState, setUserProfileState] = useState<string | undefined>(undefined);

    // Fetch user state to determine if they are a dev/owner
     useEffect(() => {
        if (user && firestore) {
            const unsub = onSnapshot(doc(firestore, 'users', user.uid), (doc) => {
                setUserProfileState(doc.data()?.state);
            });
            return () => unsub();
        }
    }, [user, firestore]);
    
    // Fetch changelog posts
    useEffect(() => {
        if (!firestore) return;
        const postsRef = collection(firestore, 'changelog');
        const q = query(postsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChangelogPost));
            setPosts(postsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching changelog:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore]);

    const canPost = userProfileState === 'dev' || userProfileState === 'owner';

    if (loading || userLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Changelog</CardTitle>
                {canPost && (
                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2" />
                                New Post
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Changelog Post</DialogTitle>
                            </DialogHeader>
                            {user && firestore && <NewPostForm user={user} firestore={firestore} onPostCreated={() => setIsFormOpen(false)} />}
                        </DialogContent>
                    </Dialog>
                )}
            </CardHeader>
            <CardContent>
                {posts.length > 0 ? (
                    <div className="space-y-6">
                        {posts.map(post => (
                            <ChangelogPostCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No changelog entries yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

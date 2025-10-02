
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
             <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
                    <Card className="w-full max-w-md shadow-lg">
                        <CardHeader className="text-center">
                            <Skeleton className="h-8 w-48 mx-auto mb-2" />
                            <Skeleton className="h-5 w-64 mx-auto" />
                        </CardHeader>
                        <CardContent className="flex flex-col items-center space-y-4">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="space-y-2 text-center">
                               <Skeleton className="h-6 w-40" />
                               <Skeleton className="h-4 w-56" />
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
                    <Card className="w-full max-w-md text-center shadow-lg">
                        <CardHeader>
                            <CardTitle>Access Denied</CardTitle>
                            <CardDescription>You must be signed in to view your profile.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={signInWithGoogle}>Sign In with Google</Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-start pt-12">
                <Card className="w-full max-w-md shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold font-headline">My Profile</CardTitle>
                        <CardDescription>Your personal account details.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                        <Avatar className="w-24 h-24 border-4 border-primary">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                            <AvatarFallback>
                                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold">{user.displayName}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

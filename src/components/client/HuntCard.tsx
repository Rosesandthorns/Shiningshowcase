
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Hunt } from '@/types/hunts';
import { Play, Pause, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { type Firestore, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface HuntCardProps {
    hunt: Hunt;
    firestore: Firestore;
}

function formatTime(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
        .map(v => v.toString().padStart(2, '0'))
        .join(':');
}


export function HuntCard({ hunt, firestore }: HuntCardProps) {
    const [encounters, setEncounters] = useState(hunt.encounters);
    const [time, setTime] = useState(hunt.timeElapsed);
    const [isActive, setIsActive] = useState(hunt.isActive);

    const huntDocRef = doc(firestore, 'users', hunt.userId, 'hunts', hunt.id);
    const timeRef = useRef(time);
    timeRef.current = time;

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive) {
            interval = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => {
            if(interval) clearInterval(interval);
        };
    }, [isActive]);
    
    // Save time on unmount or when isActive changes to false
    useEffect(() => {
        return () => {
            // This cleanup function runs when the component unmounts
            // or before the effect runs again. We only care about unmount.
            if (timeRef.current !== hunt.timeElapsed) {
                updateDoc(huntDocRef, { timeElapsed: timeRef.current, isActive: false });
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleToggleTimer = async () => {
        const newIsActive = !isActive;
        setIsActive(newIsActive);
        // Only write to DB when toggling the state, not every second
        await updateDoc(huntDocRef, { isActive: newIsActive, timeElapsed: time });
    };

    const handleIncrementEncounter = async () => {
        const newEncounters = encounters + 1;
        setEncounters(newEncounters);
        await updateDoc(huntDocRef, { encounters: newEncounters });
    };
    
    const handleDeleteHunt = async () => {
        try {
            await deleteDoc(huntDocRef);
        } catch(error) {
            console.error("Error deleting hunt: ", error);
        }
    }

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="font-headline text-2xl">{hunt.pokemonName}</CardTitle>
                    <Image src={hunt.pokemonSprite} alt={hunt.pokemonName} width={48} height={48} />
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                    <span>{hunt.game}</span>
                    <Badge variant="outline">{hunt.method}</Badge>
                    <Badge variant="secondary">1/{hunt.odds}</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Encounters</p>
                    <p className="text-5xl font-bold font-mono tracking-tighter">{encounters}</p>
                </div>
                 <div className="text-center">
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="text-3xl font-bold font-mono tracking-tighter">{formatTime(time)}</p>
                </div>
            </CardContent>
            <CardFooter className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="lg" onClick={handleToggleTimer}>
                    {isActive ? <Pause /> : <Play />}
                </Button>
                <Button variant="default" size="lg" onClick={handleIncrementEncounter} className="col-span-2">
                    <Plus className="mr-2"/> Encounter
                </Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="destructive" className="col-span-3">
                            <Trash2 className="mr-2"/> Delete Hunt
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete your hunt for {hunt.pokemonName}. This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteHunt}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
}

    
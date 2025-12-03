
'use client';

import { useState } from 'react';
import type { Pokemon } from '@/types/pokemon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deletePokemon, updatePokemon } from '@/lib/pokemon';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
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


interface EditPokemonDialogProps {
  pokemon: Pokemon;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const editSchema = z.object({
  nickname: z.string().min(1, 'Nickname is required.'),
  level: z.coerce.number().min(1).max(100),
  tags: z.string().optional(),
});

export function EditPokemonDialog({ pokemon, isOpen, onOpenChange, children }: EditPokemonDialogProps) {
  const [view, setView] = useState<'options' | 'edit' | 'delete'>('options');
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      nickname: pokemon.name,
      level: pokemon.level ? Number(pokemon.level) : 50,
      tags: pokemon.tags.join(', '),
    }
  });

  if (pokemon.isPlaceholder) {
    return <>{children}</>;
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setTimeout(() => setView('options'), 300); // Reset view after dialog closes
      form.reset();
    }
    onOpenChange(open);
  };
  
  const handleDelete = async () => {
    if (!firestore || !user) return;
    try {
        await deletePokemon(firestore, user.uid, pokemon.id);
        toast({ title: 'Pokémon Deleted', description: `${pokemon.name} has been removed from your collection.` });
        onOpenChange(false);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };
  
  async function onEditSubmit(values: z.infer<typeof editSchema>) {
    if (!firestore || !user) return;
    try {
        const updatedData: Partial<Pokemon> = {
            name: values.nickname,
            level: values.level,
            tags: values.tags ? values.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        };
        await updatePokemon(firestore, user.uid, pokemon.id, updatedData);
        toast({ title: 'Pokémon Updated', description: `${values.nickname} has been updated.` });
        onOpenChange(false);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
        {children}
        <DialogContent>
            {view === 'options' && (
                <>
                    <DialogHeader>
                        <DialogTitle>Manage {pokemon.name}</DialogTitle>
                        <DialogDescription>What would you like to do?</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4 py-4">
                        <Button onClick={() => setView('edit')}>Edit Pokémon</Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="destructive">Delete Pokémon</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete {pokemon.name}. This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </>
            )}

            {view === 'edit' && (
                <>
                    <DialogHeader>
                        <DialogTitle>Edit {pokemon.name}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
                            <FormField control={form.control} name="nickname" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nickname</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={form.control} name="level" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Level</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={form.control} name="tags" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tags (comma-separated)</FormLabel>
                                    <FormControl><Textarea {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setView('options')}>Back</Button>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </>
            )}
        </DialogContent>
    </Dialog>
  );
}

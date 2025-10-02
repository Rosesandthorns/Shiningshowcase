
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { type User } from 'firebase/auth';
import { type Firestore } from 'firebase/firestore';
import { addHunt } from '@/lib/hunts';
import { useState } from 'react';

const formSchema = z.object({
  pokemonName: z.string().min(1, { message: 'Pokémon name is required.' }),
  game: z.string().min(1, { message: 'Please select a game.' }),
  method: z.string().min(1, { message: 'Please select a method.' }),
  shinyCharm: z.boolean().default(false),
});

interface NewHuntFormProps {
  user: User;
  firestore: Firestore;
  onHuntCreated: () => void;
}

// TODO: Expand this list
const games = ["Scarlet & Violet", "Legends: Arceus", "Sword & Shield", "Let's Go Pikachu & Eevee", "Pokémon GO"];
const methods = ["Random Encounter", "Masuda Method", "Soft Reset", "Outbreaks"];


export function NewHuntForm({ user, firestore, onHuntCreated }: NewHuntFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pokemonName: '',
      shinyCharm: false,
    },
  });

  // A basic odds calculator placeholder
  const calculateOdds = (method: string, shinyCharm: boolean) => {
      let baseOdds = 4096;
      if (method === "Masuda Method") baseOdds = 683;
      if (shinyCharm) {
          if(method === "Masuda Method") return 512;
          return 1365;
      }
      return baseOdds;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
        const odds = calculateOdds(values.method, values.shinyCharm);
        
        await addHunt(firestore, user.uid, { ...values, odds });

      toast({
        title: 'Hunt Started!',
        description: `Now tracking your hunt for shiny ${values.pokemonName}.`,
      });
      onHuntCreated();
    } catch (error: any) {
      console.error("Error creating hunt:", error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not start the hunt. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="pokemonName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pokémon Name</FormLabel>
              <FormControl>
                <Input placeholder="Pikachu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="game"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {games.map(game => (
                    <SelectItem key={game} value={game}>{game}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a hunt method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {methods.map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="shinyCharm"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Shiny Charm</FormLabel>
                <FormDescription>
                  Are you using the Shiny Charm?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Starting...' : 'Start Hunt'}
        </Button>
      </form>
    </Form>
  );
}

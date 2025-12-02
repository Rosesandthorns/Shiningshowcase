'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getPokemonDetailsByName } from '@/lib/pokemonApi';
import type { Pokemon as PokemonType } from '@/types/pokemon';
import type { User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import Image from 'next/image';
import { addPokemon } from '@/lib/pokemon';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { games, natures } from '@/lib/pokemon-data';

const steps = [
    { id: 'species', title: 'Pokémon Species' },
    { id: 'details', title: 'Core Details' },
    { id: 'origin', title: 'Origin & Capture' },
    { id: 'moves', title: 'Moveset' },
    { id: 'tags', title: 'Tags' },
    { id: 'review', title: 'Review & Submit' }
];

const speciesSchema = z.object({
    speciesName: z.string().min(1, 'Pokémon name is required.'),
});

const detailsSchema = z.object({
    nickname: z.string().min(1, 'Nickname is required.'),
    level: z.coerce.number().min(1).max(100),
    nature: z.string().min(1, 'Nature is required.'),
});

const originSchema = z.object({
    gameOrigin: z.string().min(1, 'Game of origin is required.'),
    ball: z.string().min(1, 'Pokéball is required.'),
    gender: z.enum(['male', 'female', 'genderless']),
});

const movesSchema = z.object({
    moveset: z.array(z.string()).min(1, 'Select at least one move.').max(4, 'You can select up to 4 moves.'),
});

const tagsSchema = z.object({
    tags: z.string().optional(),
});


type FormData = {
    [key: string]: any;
};

interface AddPokemonClientProps {
    user: User;
    firestore: Firestore;
}

export function AddPokemonClient({ user, firestore }: AddPokemonClientProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<FormData>({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiData, setApiData] = useState<any>(null);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm({
        // This is a bit of a trick; we'll manage validation per step.
        // The overall form doesn't have a single schema.
    });

    const handleNext = async (event: React.FormEvent) => {
        event.preventDefault();

        let schema;
        const currentStepId = steps[currentStep].id;
        
        switch (currentStepId) {
            case 'species':
                schema = speciesSchema;
                break;
            case 'details':
                schema = detailsSchema;
                break;
            case 'origin':
                schema = originSchema;
                break;
            case 'moves':
                schema = movesSchema;
                break;
            case 'tags':
                schema = tagsSchema;
                break;
            default:
                break;
        }

        const data = form.getValues();
        if (schema) {
            const result = schema.safeParse(data);
            if (!result.success) {
                // Show errors
                Object.keys(result.error.formErrors.fieldErrors).forEach((field) => {
                    form.setError(field as any, {
                        type: 'manual',
                        message: result.error.formErrors.fieldErrors[field]?.[0]
                    });
                });
                return;
            }
        }

        setIsLoading(true);

        if (currentStepId === 'species') {
            try {
                const details = await getPokemonDetailsByName(data.speciesName);
                setApiData(details);
                setFormData({ ...formData, ...data });
                setCurrentStep(currentStep + 1);
            } catch (error) {
                form.setError('speciesName', { type: 'manual', message: 'Could not find this Pokémon. Check the spelling.' });
            } finally {
                setIsLoading(false);
            }
            return;
        }

        setFormData({ ...formData, ...data });
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
        setIsLoading(false);
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        const finalTags = formData.tags ? formData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];

        const newPokemonData: Omit<PokemonType, 'id' | 'shinyViewed' | 'userId'> = {
            name: formData.nickname,
            speciesName: apiData.name,
            pokedexNumber: apiData.id,
            sprites: {
                default: apiData.sprites.front_default,
                shiny: apiData.sprites.front_shiny
            },
            types: apiData.types.map((t: any) => t.type.name),
            abilities: apiData.abilities.map((a: any) => a.ability.name),
            level: formData.level,
            nature: formData.nature,
            gameOrigin: formData.gameOrigin,
            ball: formData.ball,
            gender: formData.gender,
            moveset: formData.moveset,
            tags: finalTags,
            description: '',
        };

        try {
            await addPokemon(firestore, user.uid, newPokemonData);
            toast({
                title: "Pokémon Added!",
                description: `${formData.nickname} has been added to your collection.`,
            });
            router.push(`/profile/${user.uid}/list`);
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Error Adding Pokémon',
                description: error.message || 'An unknown error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">{steps[currentStep].title}</CardTitle>
                <CardDescription>Step {currentStep + 1} of {steps.length}</CardDescription>
                <Progress value={progress} className="mt-2" />
            </CardHeader>
            <CardContent>
                <form onSubmit={handleNext} className="space-y-6">
                    {steps[currentStep].id === 'species' && (
                        <div>
                            <label htmlFor="speciesName" className="block text-sm font-medium mb-1">Pokémon Name</label>
                            <Input id="speciesName" {...form.register('speciesName')} placeholder="e.g., Pikachu" />
                            {form.formState.errors.speciesName && <p className="text-sm text-destructive mt-1">{form.formState.errors.speciesName.message as string}</p>}
                        </div>
                    )}

                    {steps[currentStep].id === 'details' && (
                        <>
                            <div>
                                <label htmlFor="nickname" className="block text-sm font-medium mb-1">Nickname</label>
                                <Input id="nickname" {...form.register('nickname')} placeholder="e.g., Sparky" />
                                {form.formState.errors.nickname && <p className="text-sm text-destructive mt-1">{form.formState.errors.nickname.message as string}</p>}
                            </div>
                            <div>
                                <label htmlFor="level" className="block text-sm font-medium mb-1">Level</label>
                                <Input id="level" type="number" {...form.register('level')} placeholder="1-100" />
                                {form.formState.errors.level && <p className="text-sm text-destructive mt-1">{form.form_state.errors.level.message as string}</p>}
                            </div>
                            <div>
                                <label htmlFor="nature" className="block text-sm font-medium mb-1">Nature</label>
                                <Select onValueChange={(value) => form.setValue('nature', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a nature" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {natures.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.nature && <p className="text-sm text-destructive mt-1">{form.formState.errors.nature.message as string}</p>}
                            </div>
                        </>
                    )}

                    {steps[currentStep].id === 'origin' && (
                        <>
                            <div>
                                <label htmlFor="gameOrigin" className="block text-sm font-medium mb-1">Game Origin</label>
                                <Select onValueChange={(value) => form.setValue('gameOrigin', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a game" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {games.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.gameOrigin && <p className="text-sm text-destructive mt-1">{form.formState.errors.gameOrigin.message as string}</p>}
                            </div>
                            <div>
                                <label htmlFor="ball" className="block text-sm font-medium mb-1">Pokéball</label>
                                <Input id="ball" {...form.register('ball')} placeholder="e.g., Master Ball"/>
                                {form.formState.errors.ball && <p className="text-sm text-destructive mt-1">{form.formState.errors.ball.message as string}</p>}
                            </div>
                             <div>
                                <label htmlFor="gender" className="block text-sm font-medium mb-1">Gender</label>
                                <Select onValueChange={(value) => form.setValue('gender', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="genderless">Genderless</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.gender && <p className="text-sm text-destructive mt-1">{form.formState.errors.gender.message as string}</p>}
                            </div>
                        </>
                    )}

                    {steps[currentStep].id === 'moves' && apiData && (
                        <div>
                             <label className="block text-sm font-medium mb-2">Moves (select up to 4)</label>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                                {apiData.moves.map((moveData: any) => (
                                    <div key={moveData.move.name} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`move-${moveData.move.name}`}
                                            value={moveData.move.name}
                                            {...form.register('moveset')}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor={`move-${moveData.move.name}`} className="text-sm capitalize">{moveData.move.name.replace('-', ' ')}</label>
                                    </div>
                                ))}
                             </div>
                              {form.formState.errors.moveset && <p className="text-sm text-destructive mt-1">{form.formState.errors.moveset.message as string}</p>}
                        </div>
                    )}
                    
                    {steps[currentStep].id === 'tags' && (
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags</label>
                            <Textarea id="tags" {...form.register('tags')} placeholder="e.g., favorite, starter, legendary (comma separated)" />
                             <p className="text-xs text-muted-foreground mt-1">Separate tags with a comma.</p>
                            {form.formState.errors.tags && <p className="text-sm text-destructive mt-1">{form.formState.errors.tags.message as string}</p>}
                        </div>
                    )}

                    {steps[currentStep].id === 'review' && apiData && (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <Image src={apiData.sprites.front_shiny} alt={formData.speciesName} width={128} height={128} />
                            </div>
                            <p><strong>Nickname:</strong> {formData.nickname}</p>
                            <p><strong>Species:</strong> {formData.speciesName}</p>
                            <p><strong>Level:</strong> {formData.level}</p>
                            <p><strong>Nature:</strong> {formData.nature}</p>
                            <p><strong>Gender:</strong> {formData.gender}</p>
                            <p><strong>Origin:</strong> {formData.gameOrigin}</p>
                            <p><strong>Ball:</strong> {formData.ball}</p>
                            <p><strong>Moves:</strong> {formData.moveset.join(', ')}</p>
                            <p><strong>Tags:</strong> {formData.tags || 'None'}</p>
                        </div>
                    )}


                    <div className="flex justify-between mt-8">
                        <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 0 || isLoading}>
                            Back
                        </Button>
                        {currentStep < steps.length - 1 ? (
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Loading...' : 'Next'}
                            </Button>
                        ) : (
                            <Button type="button" onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Add to Collection'}
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}


'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getPokemonDetailsByName, getNationalPokedex, getPokemonDetailsByUrl } from '@/lib/pokemonApi';
import type { Pokemon as PokemonType, PokedexEntry } from '@/types/pokemon';
import type { User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import Image from 'next/image';
import { addPokemon } from '@/lib/pokemon';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { games, natures } from '@/lib/pokemon-data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ChevronsUpDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';


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
    form: z.string().optional(),
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
    const [apiData, setApiData] = useState<any>(null); // Holds species data
    const [formSpecificApiData, setFormSpecificApiData] = useState<any>(null); // Holds data for the selected form
    const [fullPokedex, setFullPokedex] = useState<PokedexEntry[]>([]);
    const [filteredPokedex, setFilteredPokedex] = useState<PokedexEntry[]>([]);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [commandValue, setCommandValue] = useState("");

    const [movesSearch, setMovesSearch] = useState('');
    const [openMoves, setOpenMoves] = useState(false);


    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchPokedex = async () => {
            const dex = await getNationalPokedex();
            setFullPokedex(dex);
        };
        fetchPokedex();
    }, []);

    const handleSearch = (value: string) => {
        setCommandValue(value);
        if (value.length < 2) {
            setFilteredPokedex([]);
            return;
        }
        const lowerValue = value.toLowerCase();
        const results = fullPokedex
            .filter(p => p.speciesName.toLowerCase().includes(lowerValue))
            .slice(0, 5);
        setFilteredPokedex(results);
    };

    const form = useForm({
        resolver: zodResolver(speciesSchema),
        defaultValues: {
            speciesName: "",
            moveset: [],
        }
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
                setFormSpecificApiData(details); // Initially, the form data is the same as the base species data
                setFormData({ ...formData, ...data });
                // Pre-fill nickname with species name
                const speciesDisplayName = details.name.charAt(0).toUpperCase() + details.name.slice(1);
                form.setValue('nickname', speciesDisplayName);
                 // Set default form
                form.setValue('form', details.name);

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

        // Use the form-specific data for sprites and types
        const dataSource = formSpecificApiData || apiData;

        const newPokemonData: Omit<PokemonType, 'id' | 'shinyViewed' | 'userId'> = {
            name: formData.nickname,
            speciesName: apiData.name, // speciesName is always the base
            pokedexNumber: apiData.id,
            sprites: {
                default: dataSource.sprites.front_default,
                shiny: dataSource.sprites.front_shiny
            },
            types: dataSource.types.map((t: any) => t.type.name),
            abilities: dataSource.abilities.map((a: any) => a.ability.name),
            level: formData.level,
            nature: formData.nature,
            gameOrigin: formData.gameOrigin,
            ball: formData.ball,
            gender: formData.gender,
            moveset: formData.moveset,
            tags: finalTags,
            description: '',
            form: formData.form
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

    const handleFormChange = async (value: string) => {
        form.setValue('form', value);
        setIsLoading(true);
        try {
            const selectedVariety = apiData?.varieties.find((v: any) => v.pokemon.name === value);
            if (selectedVariety) {
                const formDetails = await getPokemonDetailsByUrl(selectedVariety.pokemon.url);
                setFormSpecificApiData(formDetails);
            } else {
                 setFormSpecificApiData(apiData); // Fallback to base data
            }
        } catch (error) {
            console.error("Failed to fetch form details:", error);
            toast({ variant: 'destructive', title: 'Could not load form data.' });
            setFormSpecificApiData(apiData); // Fallback to base data on error
        } finally {
            setIsLoading(false);
        }
    };

    const progress = ((currentStep + 1) / steps.length) * 100;
    const moveset = form.watch('moveset') || [];
    
    // Use the form-specific data if available, otherwise use base species data
    const movesDataSource = formSpecificApiData || apiData;
    const availableMoves = (movesDataSource?.moves || [])
        .map((m: any) => m.move.name)
        .filter((name: string) => !moveset.includes(name))
        .filter((name: string) => name.toLowerCase().includes(movesSearch.toLowerCase()));

    const availableForms = apiData?.varieties?.filter((v: any) => {
      // Exclude gender forms, mega forms, gmax forms etc. - we want regional forms primarily.
      const name = v.pokemon.name.toLowerCase();
      const baseName = apiData.name.toLowerCase();
      if (name === baseName) return false;
      // This is not perfect, but it's a good heuristic to get regional variants and other major forms
      // while excluding temporary battle forms.
      return !name.includes('-mega') && !name.includes('-gmax') && !name.includes('-totem') && !name.includes('-starter');
    }) || [];

    const formatFormName = (varietyName: string) => {
        const baseName = apiData.name;
        if (varietyName.startsWith(baseName + '-')) {
            return varietyName.substring(baseName.length + 1)
                .split('-')
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join(' ');
        }
        return varietyName;
    };


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
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={popoverOpen}
                                        className="w-full justify-between"
                                    >
                                        {form.watch('speciesName') || "Select Pokémon..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search Pokémon (min 2 chars)..."
                                            value={commandValue}
                                            onValueChange={handleSearch}
                                        />
                                        <CommandEmpty>No Pokémon found.</CommandEmpty>
                                        <CommandList>
                                            <CommandGroup>
                                                {filteredPokedex.map((p) => (
                                                    <CommandItem
                                                        key={p.pokedexNumber}
                                                        value={p.speciesName}
                                                        onSelect={(currentValue) => {
                                                            form.setValue("speciesName", currentValue, { shouldValidate: true });
                                                            setCommandValue(currentValue);
                                                            setFilteredPokedex([]);
                                                            setPopoverOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                form.watch('speciesName')?.toLowerCase() === p.speciesName.toLowerCase() ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {p.speciesName}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

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
                           {availableForms.length > 0 && (
                                <div>
                                    <label htmlFor="form" className="block text-sm font-medium mb-1">Form</label>
                                    <Select onValueChange={handleFormChange} defaultValue={form.watch('form')}>
                                        <SelectTrigger disabled={isLoading}>
                                            <SelectValue placeholder="Select a form" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={apiData.name}>Default</SelectItem>
                                            {availableForms.map((v: any) => (
                                                <SelectItem key={v.pokemon.name} value={v.pokemon.name}>
                                                    {formatFormName(v.pokemon.name)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.formState.errors.form && <p className="text-sm text-destructive mt-1">{form.formState.errors.form.message as string}</p>}
                                </div>
                            )}
                            <div>
                                <label htmlFor="level" className="block text-sm font-medium mb-1">Level</label>
                                <Input id="level" type="number" {...form.register('level')} placeholder="1-100" />
                                {form.formState.errors.level && <p className="text-sm text-destructive mt-1">{form.formState.errors.level?.message as string}</p>}
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

                    {steps[currentStep].id === 'moves' && movesDataSource && (
                         <div>
                            <label className="block text-sm font-medium mb-2">Moves (select up to 4)</label>
                            <Popover open={openMoves} onOpenChange={setOpenMoves}>
                                <PopoverTrigger asChild>
                                    <div className="flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background items-center flex-wrap gap-1">
                                        {moveset.map(move => (
                                            <Badge key={move} variant="secondary" className="capitalize">
                                                {move.replace('-', ' ')}
                                                <button
                                                    type="button"
                                                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                    onClick={() => {
                                                        const newMoveset = moveset.filter(m => m !== move);
                                                        form.setValue('moveset', newMoveset, { shouldValidate: true });
                                                    }}
                                                >
                                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                                </button>
                                            </Badge>
                                        ))}
                                         <span className="text-muted-foreground text-sm flex-1">{moveset.length > 0 ? '' : 'Select moves...'}</span>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search moves..."
                                            value={movesSearch}
                                            onValueChange={setMovesSearch}
                                        />
                                        <CommandList>
                                            <CommandEmpty>No moves found.</CommandEmpty>
                                            <CommandGroup>
                                                {availableMoves.map((moveName: string) => (
                                                    <CommandItem
                                                        key={moveName}
                                                        onSelect={() => {
                                                            if (moveset.length < 4) {
                                                                const newMoveset = [...moveset, moveName];
                                                                form.setValue('moveset', newMoveset, { shouldValidate: true });
                                                            }
                                                            setMovesSearch('');
                                                        }}
                                                        className="capitalize"
                                                    >
                                                        {moveName.replace('-', ' ')}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
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
                                <Image src={movesDataSource.sprites.front_shiny || apiData.sprites.front_shiny} alt={formData.speciesName} width={128} height={128} />
                            </div>
                            <p><strong>Nickname:</strong> {formData.nickname}</p>
                            <p><strong>Species:</strong> {apiData.name}</p>
                            {formData.form && formData.form !== apiData.name && <p><strong>Form:</strong> {formatFormName(formData.form)}</p>}
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
                        <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading || currentStep === 0}>
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

    
    
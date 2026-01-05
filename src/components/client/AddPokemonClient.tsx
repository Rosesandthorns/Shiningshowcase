'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
import { pokeballs } from '@/lib/pokeballs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ChevronsUpDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';

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
    moveset: z.array(z.string()).min(0, 'Select up to 4 moves.').max(4, 'You can select up to 4 moves.'),
});

const tagsSchema = z.object({
    tags: z.string().optional(),
    alpha: z.boolean().optional(),
    favorite: z.boolean().optional(),
    gmax: z.boolean().optional(),
});

const formSchema = speciesSchema.merge(detailsSchema).merge(originSchema).merge(movesSchema).merge(tagsSchema);

type FormData = z.infer<typeof formSchema>;

interface AddPokemonClientProps {
    user: User;
    firestore: Firestore;
}

const getGameAbbreviation = (gameName: string): string => {
    if (!gameName) return '';
    const mapping: { [key: string]: string } = {
        "Legends: ZA": "PLZA",
        "Scarlet & Violet": "SV",
        "Legends: Arceus": "PLA",
        "Brilliant Diamond & Shining Pearl": "BDSP",
        "Sword & Shield": "SwSh",
        "Let's Go, Pikachu & Eevee": "LGPE",
        "Ultra Sun & Ultra Moon": "USUM",
        "Sun & Moon": "SM",
        "Omega Ruby & Alpha Sapphire": "ORAS",
        "X & Y": "XY",
        "Black 2 & White 2": "B2W2",
        "Black & White": "BW",
        "HeartGold & SoulSilver": "HGSS",
        "Diamond, Pearl & Platinum": "DPP",
        "FireRed & LeafGreen": "FRLG",
        "Ruby, Sapphire & Emerald": "RSE",
        "Gold, Silver & Crystal": "GSC",
        "Red, Blue & Yellow": "RBY",
        "Pokémon GO": "PoGo"
    };
    return mapping[gameName] || gameName;
};

const toTitleCase = (str: string) => {
    if (!str) return '';
    return str.replace(/-/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

export function AddPokemonClient({ user, firestore }: AddPokemonClientProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<FormData>({
        speciesName: '',
        nickname: '',
        level: 50,
        nature: '',
        form: '',
        gameOrigin: '',
        ball: '',
        gender: 'genderless',
        moveset: [],
        tags: '',
        alpha: false,
        favorite: false,
        gmax: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [apiData, setApiData] = useState<any>(null); // species-level data (pokemon-species)
    const [genderRatio, setGenderRatio] = useState<number>(-1); // -1 for genderless, otherwise female ratio
    const [formSpecificApiData, setFormSpecificApiData] = useState<any>(null); // detailed pokemon data (pokemon)
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
            setIsLoading(true);
            try {
                const pokedex = await getNationalPokedex();
                setFullPokedex(pokedex);
                setFilteredPokedex(pokedex);
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not load Pokédex data.',
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchPokedex();
    }, [toast]);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            speciesName: '',
            nickname: '',
            level: 50,
            nature: '',
            form: '',
            gameOrigin: '',
            ball: '',
            gender: 'genderless',
            moveset: [],
            tags: '',
            alpha: false,
            favorite: false,
            gmax: false,
        }
    });

    // Keep filtered list up to date with the typed value
    useEffect(() => {
        if (commandValue) {
            const results = fullPokedex.filter(p =>
                p.speciesName.toLowerCase().includes(commandValue.toLowerCase())
            );
            setFilteredPokedex(results);
        } else {
            setFilteredPokedex(fullPokedex);
        }
    }, [commandValue, fullPokedex]);

    const handleNext = async (data: any) => {
        form.clearErrors();

        const newFormData = { ...formData, ...data };
        setFormData(newFormData);

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Final submission
            await handleSubmit(newFormData);
        }
    };

    const normalizeSpeciesForApi = (speciesName: string) => {
        // replace spaces and common punctuation with hyphens, lowercase; handle common diacritics roughly
        return speciesName
            .toLowerCase()
            .replace(/[’'`.]/g, '')
            .replace(/[\s]+/g, '-')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''); // strip diacritics
    };

    const handleSelectSpecies = async (selectedValue: string) => {
        const speciesName = selectedValue;
        form.setValue('speciesName', speciesName.charAt(0).toUpperCase() + speciesName.slice(1));
        setPopoverOpen(false);
        setIsLoading(true);

        try {
            // Step 1: Fetch species-level data (contains varieties)
            const speciesData = await getPokemonDetailsByName(normalizeSpeciesForApi(speciesName));
            setApiData(speciesData); // species-level data
            setGenderRatio(speciesData.gender_rate);

            // Step 2: Find the default variety and fetch its detailed pokemon data
            const defaultVariety = speciesData.varieties?.find((v: any) => v.is_default);
            if (!defaultVariety) {
                toast({ variant: 'destructive', title: 'Error', description: "Could not find default data for this Pokémon." });
                setIsLoading(false);
                return;
            }

            const formDetails = await getPokemonDetailsByUrl(defaultVariety.pokemon.url);
            setFormSpecificApiData(formDetails);

            // Set reasonable defaults
            form.setValue('nickname', formDetails.name.charAt(0).toUpperCase() + formDetails.name.slice(1));
            form.setValue('level', 50);

            if (speciesData.gender_rate === -1) {
                form.setValue('gender', 'genderless');
            } else if (speciesData.gender_rate === 0) {
                form.setValue('gender', 'male');
            } else if (speciesData.gender_rate === 8) {
                form.setValue('gender', 'female');
            } else {
                form.setValue('gender', 'male'); // Default to male for mixed gender
            }

            setCurrentStep(1); // Auto-advance to the next step
        } catch (error) {
            console.error("Error fetching Pokémon details:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not find details for that Pokémon.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (finalData: FormData) => {
        setIsLoading(true);
        try {
            const userTags = finalData.tags ? finalData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];
            const typeTags = (formSpecificApiData?.types || []).map((t: any) => t.type.name);
            const gameTag = getGameAbbreviation(finalData.gameOrigin);

            const autoTags = [...typeTags];
            if (gameTag) autoTags.push(gameTag);
            if (finalData.alpha) autoTags.push('Alpha');
            if (finalData.favorite) autoTags.push('Favorite');
            if (finalData.gmax) autoTags.push('G-Max');

            const combinedTags = [...new Set([...userTags, ...autoTags])];

            await addPokemon(firestore, user.uid, {
                name: finalData.nickname,
                pokedexNumber: apiData?.id ?? null,
                speciesName: formSpecificApiData?.name ?? form.getValues('speciesName'),
                sprites: {
                    default: formSpecificApiData?.sprites?.front_default ?? null,
                    shiny: formSpecificApiData?.sprites?.front_shiny ?? null,
                },
                types: (formSpecificApiData?.types || []).map((t: any) => t.type.name),
                abilities: (formSpecificApiData?.abilities || []).map((a: any) => a.ability.name),
                level: finalData.level,
                nature: finalData.nature,
                form: finalData.form || formSpecificApiData?.name || '',
                gameOrigin: finalData.gameOrigin,
                ball: finalData.ball,
                gender: finalData.gender,
                moveset: finalData.moveset,
                tags: combinedTags,
                caughtAt: Date.now(),
            });

            toast({
                title: 'Pokémon Added!',
                description: `${finalData.nickname} has been added to your collection.`,
            });
            router.push(`/profile/${user.uid}/list`);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error Adding Pokémon',
                description: error?.message || 'An unknown error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormChange = async (value: string) => {
        form.setValue('form', value);
        setIsLoading(true);
        try {
            const selectedVariety = apiData?.varieties?.find((v: any) => v.pokemon.name === value);
            if (selectedVariety) {
                const formDetails = await getPokemonDetailsByUrl(selectedVariety.pokemon.url);
                setFormSpecificApiData(formDetails);
            } else {
                // fallback to default variety details if possible
                const defaultVariety = apiData?.varieties?.find((v: any) => v.is_default);
                if (defaultVariety) {
                    const formDetails = await getPokemonDetailsByUrl(defaultVariety.pokemon.url);
                    setFormSpecificApiData(formDetails);
                } else {
                    setFormSpecificApiData(apiData); // last resort
                }
            }
        } catch (error) {
            console.error("Failed to fetch form details:", error);
            toast({ variant: 'destructive', title: 'Could not load form data.' });
            setFormSpecificApiData(apiData);
        } finally {
            setIsLoading(false);
        }
    };

    const progress = ((currentStep + 1) / steps.length) * 100;
    const moveset = form.watch('moveset') || [];

    const canGmax = useMemo(() => {
        return apiData?.varieties?.some((v: any) => v.pokemon.name.includes('-gmax'));
    }, [apiData]);

    const genderOptions = useMemo(() => {
        if (genderRatio === -1) return [{ value: 'genderless', label: 'Genderless' }];
        if (genderRatio === 0) return [{ value: 'male', label: 'Male' }];
        if (genderRatio === 8) return [{ value: 'female', label: 'Female' }];
        return [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
        ];
    }, [genderRatio]);

    // Use the form-specific data if available, otherwise use base species data
    const movesDataSource = formSpecificApiData || apiData;
    const availableMoves = (movesDataSource?.moves || [])
        .filter((move: any) => !moveset.includes(move.move.name))
        .filter((move: any) => {
            const searchTerm = movesSearch.toLowerCase().replace(/-/g, ' ');
            const moveName = (move.move.name || '').toLowerCase().replace(/-/g, ' ');
            return moveName.includes(searchTerm);
        });

    const availableForms = apiData?.varieties?.filter((v: any) => {
        // Exclude mega/gmax/gender-differentiated forms; include regional and named forms
        const name = v.pokemon.name.toLowerCase();
        const baseName = apiData.name?.toLowerCase?.() ?? '';
        if (!baseName) return false;
        if (name === baseName) return true; // include default
        const formDetails = name.replace(baseName + '-', '');
        if (Array.isArray(apiData.form_names) && apiData.form_names.find((fn: any) => fn.name.toLowerCase() === formDetails && fn.language.name === 'en')) {
            return true;
        }
        if (name.includes('-alola') || name.includes('-galar') || name.includes('-hisui') || name.includes('-paldea') || name.includes('-hisui')) {
            return true;
        }
        return false;
    }) || [];

    const formatFormName = (varietyName: string) => {
        const baseName = apiData?.name ?? '';
        if (!baseName) return varietyName.charAt(0).toUpperCase() + varietyName.slice(1);
        if (varietyName.startsWith(baseName + '-')) {
            return varietyName.substring(baseName.length + 1)
                .split('-')
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join(' ');
        }
        return varietyName.charAt(0).toUpperCase() + varietyName.slice(1);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">{steps[currentStep].title}</CardTitle>
                <CardDescription>Step {currentStep + 1} of {steps.length}</CardDescription>
                <Progress value={progress} className="mt-2" />
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6">
                        {steps[currentStep].id === 'species' && (
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
                                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[60vh] p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search Pokémon..."
                                            value={commandValue}
                                            onValueChange={setCommandValue}
                                        />
                                        <CommandEmpty>No Pokémon found.</CommandEmpty>
                                        <CommandList>
                                            <CommandGroup>
                                                {filteredPokedex.map((p) => (
                                                    <CommandItem
                                                        key={p.pokedexNumber}
                                                        value={p.speciesName}
                                                        onSelect={(currentValue) => {
                                                            const normalized = currentValue;
                                                            form.setValue('speciesName', normalized.charAt(0).toUpperCase() + normalized.slice(1));
                                                            handleSelectSpecies(normalized);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                form.getValues('speciesName')?.toLowerCase() === p.speciesName.toLowerCase() ? "opacity-100" : "opacity-0"
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
                        )}

                        {steps[currentStep].id === 'details' && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="nickname"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nickname</FormLabel>
                                            <FormControl><Input placeholder="Sparky" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {availableForms.length > 1 && (
                                    <FormField
                                        control={form.control}
                                        name="form"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Form</FormLabel>
                                                <Select onValueChange={(value) => handleFormChange(value)} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a form" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {availableForms.map((v: any) => (
                                                            <SelectItem key={v.pokemon.name} value={v.pokemon.name}>
                                                                {formatFormName(v.pokemon.name)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="level"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Level</FormLabel>
                                            <FormControl><Input type="number" min={1} max={100} placeholder="1-100" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="nature"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nature</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select a nature" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {natures.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        {steps[currentStep].id === 'origin' && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="gameOrigin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Game Origin</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select a game" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {games.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="ball"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pokéball</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select a Pokéball" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {pokeballs.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={genderOptions.length === 1}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {genderOptions.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        {steps[currentStep].id === 'moves' && movesDataSource && (
                            <FormField
                                control={form.control}
                                name="moveset"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Moves (select up to 4)</FormLabel>
                                        {moveset.length < 4 && (
                                        <Popover open={openMoves} onOpenChange={setOpenMoves}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start h-auto min-h-10">
                                                    {moveset.length > 0 ? (
                                                        <div className="flex gap-1 flex-wrap">
                                                            {moveset.map(move => (
                                                                <Badge key={move} variant="secondary" className="capitalize flex items-center gap-2">
                                                                    <span className="truncate">{move.replace('-', ' ')}</span>
                                                                    <button
                                                                        type="button"
                                                                        aria-label={`Remove ${move}`}
                                                                        className="ml-1 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            field.onChange(moveset.filter(m => m !== move));
                                                                        }}
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : "Select moves..."}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                <Command>
                                                    <CommandInput
                                                        placeholder="Search moves..."
                                                        value={movesSearch}
                                                        onValueChange={setMovesSearch}
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>No moves found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {availableMoves.map((move: any) => (
                                                                <CommandItem
                                                                    key={move.move.name}
                                                                    onSelect={() => {
                                                                        if (moveset.length < 4) {
                                                                            field.onChange([...moveset, move.move.name]);
                                                                        }
                                                                    }}
                                                                >
                                                                    {move.move.name.replace('-', ' ')}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        )}
                                        {moveset.length > 0 && (
                                            <div className="flex gap-1 flex-wrap mt-2">
                                                {moveset.map(move => (
                                                    <Badge key={move} variant="secondary" className="capitalize flex items-center gap-2">
                                                        <span className="truncate">{move.replace('-', ' ')}</span>
                                                        <button
                                                            type="button"
                                                            aria-label={`Remove ${move}`}
                                                            className="ml-1 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                field.onChange(moveset.filter(m => m !== move));
                                                            }}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )} />
                        )}

                        {steps[currentStep].id === 'tags' && (
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="alpha"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Alpha</FormLabel>
                                                <FormDescription>Mark this Pokémon as an Alpha Pokémon.</FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="favorite"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Favorite</FormLabel>
                                                <FormDescription>Mark this Pokémon as a favorite.</FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                {canGmax && (
                                    <FormField
                                        control={form.control}
                                        name="gmax"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>G-Max</FormLabel>
                                                    <FormDescription>Mark this Pokémon as capable of Gigantamaxing.</FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                )}
                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Additional Tags</FormLabel>
                                            <FormControl><Input placeholder="e.g., starter, legendary (comma separated)" {...field} /></FormControl>
                                            <FormDescription>Separate tags with a comma. Type and game tags will be added automatically.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {steps[currentStep].id === 'review' && (
                            <div className="space-y-4 rounded-lg border p-4">
                                <div className="flex justify-center">
                                    <Image
                                        src={formSpecificApiData?.sprites?.front_shiny || apiData?.sprites?.front_shiny || 'https://placehold.co/128x128.png'}
                                        alt={formData.nickname || 'Pokémon'}
                                        width={128}
                                        height={128}
                                        className="object-contain"
                                    />
                                </div>
                                <h3 className="text-center text-lg font-bold">{formData.nickname}</h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <p><strong>Species:</strong> {toTitleCase(formSpecificApiData?.name ?? form.getValues('speciesName'))}</p>
                                    <p><strong>Pokédex #:</strong> {apiData?.id ?? '—'}</p>
                                    <p><strong>Level:</strong> {formData.level}</p>
                                    <p><strong>Nature:</strong> {formData.nature}</p>
                                    <p><strong>Gender:</strong> {toTitleCase(formData.gender)}</p>
                                    <p><strong>Origin:</strong> {formData.gameOrigin}</p>
                                    <p><strong>Ball:</strong> {formData.ball}</p>
                                    <p className="col-span-2"><strong>Moves:</strong> {Array.isArray(formData.moveset) ? formData.moveset.map(toTitleCase).join(', ') : ''}</p>
                                    <p className="col-span-2"><strong>Tags:</strong> {formData.tags || 'None'}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 0 || isLoading}>
                                Back
                            </Button>
                            {currentStep < steps.length - 1 ? (
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Loading...' : 'Next'}
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Saving...' : 'Add to Collection'}
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

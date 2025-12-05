
'use client';

import { useState, useEffect } from 'react';
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
    moveset: z.array(z.string()).min(0, 'Select up to 4 moves.').max(4, 'You can select up to 4 moves.'),
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

    const schemas = [speciesSchema, detailsSchema, originSchema, movesSchema, tagsSchema, z.object({})];
    const form = useForm({
        resolver: zodResolver(schemas[currentStep]),
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
        }
    });

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
    
    const handleSelectSpecies = async (selectedValue: string) => {
        const speciesName = selectedValue;
        form.setValue('speciesName', speciesName);
        setPopoverOpen(false);

        setIsLoading(true);
        try {
            const apiDetails = await getPokemonDetailsByName(speciesName.toLowerCase().replace(/[\s.'é]+/g, '-'));
            setApiData(apiDetails);
            setFormSpecificApiData(apiDetails);
            form.setValue('nickname', apiDetails.name.charAt(0).toUpperCase() + apiDetails.name.slice(1));
            form.setValue('level', 50);
            setCurrentStep(1); // Auto-advance to next step
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not find details for that Pokémon.' });
        } finally {
            setIsLoading(false);
        }
    };


    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (finalData: FormData) => {
        setIsLoading(true);
        try {
            await addPokemon(firestore, user.uid, {
                name: finalData.nickname,
                pokedexNumber: apiData.id, // Always use the base species ID
                speciesName: formSpecificApiData.name, // Use the form-specific name
                sprites: {
                    default: formSpecificApiData.sprites.front_default,
                    shiny: formSpecificApiData.sprites.front_shiny,
                },
                types: formSpecificApiData.types.map((t: any) => t.type.name),
                abilities: formSpecificApiData.abilities.map((a: any) => a.ability.name),
                level: finalData.level,
                nature: finalData.nature,
                form: finalData.form || formSpecificApiData.name,
                gameOrigin: finalData.gameOrigin,
                ball: finalData.ball,
                gender: finalData.gender,
                moveset: finalData.moveset,
                tags: finalData.tags ? finalData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [],
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
        .filter((move: any) => !moveset.includes(move.move.name))
        .filter((move: any) => {
            const searchTerm = movesSearch.toLowerCase();
            // Match if search term is in the move name, ignoring hyphens for searching
            return move.move.name.replace(/-/g, ' ').includes(searchTerm);
        });


    const availableForms = apiData?.varieties?.filter((v: any) => {
      // Exclude gender forms, mega forms, gmax forms etc. - we want regional forms primarily.
      const name = v.pokemon.name.toLowerCase();
      const baseName = apiData.name.toLowerCase();
      if (name === baseName) return true; // Include the default form
      
      const formDetails = name.replace(baseName + '-', '');

      if(apiData.form_names?.find((fn: any) => fn.name.toLowerCase() === formDetails && fn.language.name === 'en')) {
        return true;
      }

      // Fallback for things like regional forms that aren't in form_names
      if (name.includes('-alola') || name.includes('-galar') || name.includes('-hisui') || name.includes('-paldea')) {
          return true;
      }
      
      return false;
    }) || [];

    const formatFormName = (varietyName: string) => {
        const baseName = apiData.name;
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
                                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
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
                                                                form.setValue('speciesName', currentValue.charAt(0).toUpperCase() + currentValue.slice(1));
                                                                handleSelectSpecies(currentValue);
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
                                            <FormControl><Input type="number" min="1" max="100" placeholder="1-100" {...field} /></FormControl>
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
                                            <FormControl><Input placeholder="e.g., Master Ball" {...field} /></FormControl>
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
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="genderless">Genderless</SelectItem>
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
                                    <Popover open={openMoves} onOpenChange={setOpenMoves}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start h-auto min-h-10">
                                                    {moveset.length > 0 ? (
                                                        <div className="flex gap-1 flex-wrap">
                                                            {moveset.map(move => (
                                                                <Badge key={move} variant="secondary" className="capitalize">
                                                                    {move.replace('-', ' ')}
                                                                    <span
                                                                        role="button"
                                                                        aria-label={`Remove ${move}`}
                                                                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            field.onChange(moveset.filter(m => m !== move));
                                                                        }}
                                                                    ><X className="h-3 w-3" /></span>
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
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        )}
                        
                        {steps[currentStep].id === 'tags' && (
                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Tags</FormLabel>
                                    <FormControl><Input placeholder="e.g., favorite, starter, legendary (comma separated)" {...field} /></FormControl>
                                    <FormDescription>Separate tags with a comma.</FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {steps[currentStep].id === 'review' && (
                            <div className="space-y-4 rounded-lg border p-4">
                                <div className="flex justify-center">
                                    <Image src={formSpecificApiData?.sprites?.front_shiny || apiData?.sprites?.front_shiny || 'https://placehold.co/128x128.png'} alt={formData.nickname || 'Pokémon'} width={128} height={128} />
                                </div>
                                <h3 className="text-center text-lg font-bold">{formData.nickname}</h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <p><strong>Species:</strong> {formSpecificApiData?.name}</p>
                                    <p><strong>Pokédex #:</strong> {apiData?.id}</p>
                                    <p><strong>Level:</strong> {formData.level}</p>
                                    <p><strong>Nature:</strong> {formData.nature}</p>
                                    <p><strong>Gender:</strong> {formData.gender}</p>
                                    <p><strong>Origin:</strong> {formData.gameOrigin}</p>
                                    <p><strong>Ball:</strong> {formData.ball}</p>
                                    <p className="col-span-2"><strong>Moves:</strong> {formData.moveset.join(', ')}</p>
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

    

    
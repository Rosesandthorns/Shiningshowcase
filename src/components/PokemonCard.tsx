import Image from 'next/image';
import Link from 'next/link';
import type { Pokemon } from '@/types/pokemon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShinySparkleIcon } from '@/components/icons/ShinySparkleIcon';

interface PokemonCardProps {
  pokemon: Pokemon;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  return (
    <Link href={`/pokemon/${pokemon.id}`} className="block group">
      <Card className="h-full overflow-hidden transition-all duration-200 ease-in-out group-hover:scale-105 group-hover:shadow-xl hover:border-primary">
        <CardHeader className="p-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-headline">{pokemon.name}</CardTitle>
            <ShinySparkleIcon viewed={pokemon.shinyViewed} />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex flex-col items-center">
          <div className="relative w-24 h-24 mb-2">
            <Image
              src={pokemon.sprites.default}
              alt={pokemon.name}
              fill
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={`${pokemon.name} default sprite`}
            />
          </div>
          <div className="flex flex-wrap gap-1 justify-center">
            {pokemon.types.slice(0, 2).map(type => (
              <Badge key={type} variant="secondary" className="text-xs">{type}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

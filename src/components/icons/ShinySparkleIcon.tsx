
import { Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShinySparkleIconProps {
  viewed: boolean;
  className?: string;
  isShinyLocked?: boolean;
}

export function ShinySparkleIcon({ viewed, className, isShinyLocked = false }: ShinySparkleIconProps) {
  if (isShinyLocked) {
    return (
       <Star
        className={cn(
          'h-5 w-5 transition-colors text-yellow-500 fill-yellow-400',
          className
        )}
      />
    )
  }

  return (
    <Sparkles
      className={cn(
        'h-5 w-5 transition-colors',
        viewed ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground opacity-50',
        className
      )}
    />
  );
}

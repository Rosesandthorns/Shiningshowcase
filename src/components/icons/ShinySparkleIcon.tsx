import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShinySparkleIconProps {
  viewed: boolean;
  className?: string;
}

export function ShinySparkleIcon({ viewed, className }: ShinySparkleIconProps) {
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

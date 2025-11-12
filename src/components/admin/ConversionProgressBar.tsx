import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ConversionProgressBarProps {
  current: number;
  total: number;
  currentFileName: string;
  percentage: number;
}

export function ConversionProgressBar({
  current,
  total,
  currentFileName,
  percentage
}: ConversionProgressBarProps) {
  return (
    <Card className="p-6 bg-primary/5 border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            <div>
              <p className="font-medium">Convertendo imagens...</p>
              <p className="text-sm text-muted-foreground">
                {current} de {total} imagens
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold text-primary">
            {percentage}%
          </div>
        </div>

        <Progress value={percentage} className="h-2" />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">Arquivo atual:</span>
          <span className="truncate flex-1" title={currentFileName}>
            {currentFileName}
          </span>
        </div>
      </div>
    </Card>
  );
}

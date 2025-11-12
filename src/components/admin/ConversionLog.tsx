import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Terminal } from 'lucide-react';

interface ConversionLogProps {
  logs: string[];
}

export function ConversionLog({ logs }: ConversionLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (logs.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          <CardTitle className="text-sm font-medium">Log de Conversão</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 w-full rounded-md border bg-muted/30 p-4" ref={scrollRef}>
          <div className="space-y-1 font-mono text-xs">
            {logs.map((log, index) => {
              const isSuccess = log.includes('✓');
              const isError = log.includes('✗');

              return (
                <div
                  key={index}
                  className="flex items-start gap-2 py-1"
                >
                  {isSuccess && (
                    <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  )}
                  {isError && (
                    <XCircle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                  )}
                  <span className={isError ? 'text-destructive' : 'text-foreground'}>
                    {log}
                  </span>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

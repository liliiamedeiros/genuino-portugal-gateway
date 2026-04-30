import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarClock, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function WeeklyAuditTriggerCard() {
  const [running, setRunning] = useState(false);
  const [last, setLast] = useState<any>(null);
  const { toast } = useToast();

  const run = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("scheduled-weekly-audit", { body: { source: "manual" } });
      if (error) throw error;
      setLast(data);
      toast({
        title: "Auditoria semanal executada",
        description: `${data.routes} rotas · ${data.ok_screenshots} screenshots OK · ${data.failed_screenshots} erros`,
      });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-muted/30 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <CalendarClock className="w-5 h-5" />
        <h3 className="font-semibold">Weekly Auto Audit</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Corre automaticamente toda 2ª-feira às 03:30 UTC: responsive audit das páginas publicadas nos últimos 7 dias + WebP coverage check.
      </p>
      <Button onClick={run} size="sm" className="mt-auto" disabled={running}>
        {running ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <PlayCircle className="w-4 h-4 mr-1" />}
        Correr agora
      </Button>
      {last && (
        <div className="text-[11px] text-muted-foreground border-t pt-2 mt-1">
          Última execução manual: {last.routes} rotas · {last.ok_screenshots} OK · {last.failed_screenshots} falhas
        </div>
      )}
    </div>
  );
}
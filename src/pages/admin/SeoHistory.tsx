import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useState } from 'react';
import { History } from 'lucide-react';

interface HistoryEntry {
  id: string;
  user_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  old_value: unknown;
  new_value: unknown;
  created_at: string;
}

export default function SeoHistory() {
  const [filterType, setFilterType] = useState<string>('all');

  const { data: history, isLoading } = useQuery({
    queryKey: ['seo-history', filterType],
    queryFn: async () => {
      let query = supabase
        .from('seo_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterType !== 'all') {
        query = query.eq('entity_type', filterType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HistoryEntry[];
    },
  });

  const actionLabel = (action: string) => {
    switch (action) {
      case 'create': return 'Criação';
      case 'update': return 'Atualização';
      case 'delete': return 'Eliminação';
      default: return action;
    }
  };

  const actionVariant = (action: string) => {
    switch (action) {
      case 'create': return 'default' as const;
      case 'update': return 'secondary' as const;
      case 'delete': return 'destructive' as const;
      default: return 'outline' as const;
    }
  };

  const entityLabel = (type: string) => {
    switch (type) {
      case 'stage': return 'Etapa';
      case 'question': return 'Pergunta';
      case 'response': return 'Resposta';
      case 'rule': return 'Regra';
      default: return type;
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Histórico SEO</h1>
            <p className="text-muted-foreground">Registo de todas as alterações</p>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="stage">Etapas</SelectItem>
              <SelectItem value="question">Perguntas</SelectItem>
              <SelectItem value="response">Respostas</SelectItem>
              <SelectItem value="rule">Regras</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">A carregar...</p>
        ) : !history?.length ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
              <History className="h-8 w-8" />
              <p>Nenhum registo encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map(entry => (
              <Card key={entry.id}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={actionVariant(entry.action)}>
                        {actionLabel(entry.action)}
                      </Badge>
                      <Badge variant="outline">{entityLabel(entry.entity_type)}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {entry.new_value && typeof entry.new_value === 'object' && 'name' in (entry.new_value as any)
                          ? (entry.new_value as any).name
                          : entry.new_value && typeof entry.new_value === 'object' && 'label' in (entry.new_value as any)
                          ? (entry.new_value as any).label
                          : entry.entity_id.substring(0, 8)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.created_at), "dd MMM yyyy 'às' HH:mm", { locale: pt })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

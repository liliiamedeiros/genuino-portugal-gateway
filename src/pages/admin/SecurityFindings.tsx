import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Shield, Download, RefreshCw, Loader2 } from 'lucide-react';

type Severity = 'info' | 'low' | 'warn' | 'medium' | 'high' | 'critical';
type Status = 'new' | 'confirmed' | 'fixed' | 'ignored';

interface Finding {
  id: string;
  scanner_name: string;
  internal_id: string;
  title: string;
  description: string | null;
  severity: Severity;
  status: Status;
  url: string | null;
  details: Record<string, unknown>;
  first_seen_at: string;
  last_seen_at: string;
  resolved_at: string | null;
  notes: string | null;
}

const SEV_BADGE: Record<Severity, string> = {
  info: 'bg-gray-500/10 text-gray-700 dark:text-gray-300',
  low: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  warn: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  medium: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  high: 'bg-red-500/10 text-red-700 dark:text-red-300',
  critical: 'bg-red-600 text-white',
};

const STATUS_BADGE: Record<Status, string> = {
  new: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  confirmed: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  fixed: 'bg-green-500/10 text-green-700 dark:text-green-300',
  ignored: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

function toCsv(rows: Finding[]): string {
  const header = ['scanner_name', 'internal_id', 'severity', 'status', 'title', 'url', 'last_seen_at', 'notes'];
  const esc = (v: unknown) => {
    const s = String(v ?? '').replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const body = rows.map((r) =>
    [r.scanner_name, r.internal_id, r.severity, r.status, r.title, r.url ?? '', r.last_seen_at, r.notes ?? '']
      .map(esc)
      .join(','),
  );
  return [header.join(','), ...body].join('\n');
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function SecurityFindings() {
  const [rows, setRows] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [sevFilter, setSevFilter] = useState<'all' | Severity>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Finding | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('security_findings')
      .select('*')
      .order('last_seen_at', { ascending: false });
    if (error) {
      toast({ title: 'Erro a carregar findings', description: error.message, variant: 'destructive' });
    } else {
      setRows((data ?? []) as Finding[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (sevFilter !== 'all' && r.severity !== sevFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!`${r.title} ${r.internal_id} ${r.scanner_name}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [rows, statusFilter, sevFilter, search]);

  const counts = useMemo(() => {
    const c: Record<Status, number> = { new: 0, confirmed: 0, fixed: 0, ignored: 0 };
    rows.forEach((r) => { c[r.status] = (c[r.status] ?? 0) + 1; });
    return c;
  }, [rows]);

  const updateStatus = async (id: string, status: Status, notes?: string) => {
    setSavingId(id);
    const patch: Record<string, unknown> = { status, notes };
    if (status === 'fixed' || status === 'ignored') {
      patch.resolved_at = new Date().toISOString();
    } else {
      patch.resolved_at = null;
    }
    const { error } = await supabase.from('security_findings').update(patch).eq('id', id);
    if (error) {
      toast({ title: 'Erro a atualizar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Atualizado' });
      await load();
    }
    setSavingId(null);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Security Findings</h1>
              <p className="text-sm text-muted-foreground">
                Achados de todos os scans (Supabase, Wiz, npm audit, regressão de templates).
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Recarregar</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => download(`security-findings-${new Date().toISOString().slice(0,10)}.csv`, toCsv(filtered), 'text/csv')}
              disabled={filtered.length === 0}
            >
              <Download className="h-4 w-4 mr-2" /> CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['new', 'confirmed', 'fixed', 'ignored'] as Status[]).map((s) => (
            <Card key={s}>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs uppercase text-muted-foreground">{s}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{counts[s] ?? 0}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Pesquisar título, ID, scanner..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="new">Novo</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="fixed">Fixo</SelectItem>
                  <SelectItem value="ignored">Ignorado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sevFilter} onValueChange={(v) => setSevFilter(v as any)}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas severidades</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="warn">Warn</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {rows.length === 0
                  ? 'Sem findings registados. Use o workflow de CI ou um script para inserir resultados.'
                  : 'Nenhum finding corresponde aos filtros.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Scanner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última vez</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Badge variant="outline" className={SEV_BADGE[r.severity]}>
                          {r.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium max-w-[420px] truncate" title={r.title}>
                        {r.title}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.scanner_name}</TableCell>
                      <TableCell>
                        <Select
                          value={r.status}
                          onValueChange={(v) => updateStatus(r.id, v as Status, r.notes ?? undefined)}
                          disabled={savingId === r.id}
                        >
                          <SelectTrigger className={`w-[130px] h-8 ${STATUS_BADGE[r.status]}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Novo</SelectItem>
                            <SelectItem value="confirmed">Confirmado</SelectItem>
                            <SelectItem value="fixed">Fixo</SelectItem>
                            <SelectItem value="ignored">Ignorado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.last_seen_at).toLocaleString('pt-PT')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => setSelected(r)}>
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-2xl">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Badge variant="outline" className={SEV_BADGE[selected.severity]}>
                      {selected.severity.toUpperCase()}
                    </Badge>
                    {selected.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-xs uppercase text-muted-foreground">Scanner / ID</div>
                    <div className="font-mono text-xs">{selected.scanner_name} / {selected.internal_id}</div>
                  </div>
                  {selected.description && (
                    <div>
                      <div className="text-xs uppercase text-muted-foreground">Descrição</div>
                      <div className="whitespace-pre-wrap">{selected.description}</div>
                    </div>
                  )}
                  {selected.url && (
                    <div>
                      <div className="text-xs uppercase text-muted-foreground">Remediação</div>
                      <a href={selected.url} target="_blank" rel="noreferrer" className="text-primary underline break-all">
                        {selected.url}
                      </a>
                    </div>
                  )}
                  <div>
                    <div className="text-xs uppercase text-muted-foreground">Notas</div>
                    <Textarea
                      defaultValue={selected.notes ?? ''}
                      onBlur={(e) => {
                        if (e.target.value !== (selected.notes ?? '')) {
                          updateStatus(selected.id, selected.status, e.target.value);
                        }
                      }}
                      rows={3}
                    />
                  </div>
                  {Object.keys(selected.details ?? {}).length > 0 && (
                    <div>
                      <div className="text-xs uppercase text-muted-foreground">Detalhes</div>
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-48">
                        {JSON.stringify(selected.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
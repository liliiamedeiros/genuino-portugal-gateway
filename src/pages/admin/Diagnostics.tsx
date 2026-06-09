import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, Loader2, PlayCircle } from 'lucide-react';

type Check = {
  name: string;
  description: string;
  status: 'idle' | 'running' | 'ok' | 'fail';
  detail?: string;
  count?: number;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

/** Anonymous (no JWT) fetch via PostgREST to simulate a public visitor. */
async function anonCount(table: string): Promise<number> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`,
    {
      headers: {
        apikey: ANON_KEY,
        Prefer: 'count=exact',
        Range: '0-0',
      },
    }
  );
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status} — ${txt.slice(0, 200)}`);
  }
  const range = res.headers.get('content-range') || '';
  const total = parseInt(range.split('/')[1] || '0', 10);
  return isNaN(total) ? 0 : total;
}

export default function Diagnostics() {
  const [checks, setChecks] = useState<Check[]>([
    { name: 'Anon → portfolio_projects', description: 'Visitante público consegue ler portefólio', status: 'idle' },
    { name: 'Anon → projects', description: 'Visitante público consegue ler imóveis', status: 'idle' },
    { name: 'Anon → site_settings', description: 'Configurações do site acessíveis', status: 'idle' },
    { name: 'Anon → navigation_menus', description: 'Menus de navegação acessíveis', status: 'idle' },
    { name: 'Anon → services', description: 'Serviços acessíveis', status: 'idle' },
    { name: 'Auth → profiles (self)', description: 'Utilizador autenticado vê o seu perfil', status: 'idle' },
    { name: 'Function has_role()', description: 'RLS policy helper executável por anon', status: 'idle' },
  ]);
  const [running, setRunning] = useState(false);

  const update = (i: number, patch: Partial<Check>) =>
    setChecks((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const run = async () => {
    setRunning(true);
    setChecks((prev) => prev.map((c) => ({ ...c, status: 'idle', detail: undefined, count: undefined })));

    const anonTables = ['portfolio_projects', 'projects', 'site_settings', 'navigation_menus', 'services'];
    for (let i = 0; i < anonTables.length; i++) {
      update(i, { status: 'running' });
      try {
        const count = await anonCount(anonTables[i]);
        update(i, { status: 'ok', count, detail: `${count} linha(s) visíveis para anon` });
      } catch (e: any) {
        update(i, { status: 'fail', detail: e.message });
      }
    }

    // Auth profiles check
    update(5, { status: 'running' });
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        update(5, { status: 'fail', detail: 'Sem sessão autenticada' });
      } else {
        const { data, error } = await supabase.from('profiles').select('id,email').eq('id', u.user.id).maybeSingle();
        if (error) update(5, { status: 'fail', detail: error.message });
        else update(5, { status: 'ok', detail: `OK — ${data?.email ?? 'sem email'}` });
      }
    } catch (e: any) {
      update(5, { status: 'fail', detail: e.message });
    }

    // has_role anon test (call via RPC w/o token)
    update(6, { status: 'running' });
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/has_role`, {
        method: 'POST',
        headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ _user_id: '00000000-0000-0000-0000-000000000000', _role: 'admin' }),
      });
      if (!res.ok) {
        const t = await res.text();
        update(6, { status: 'fail', detail: `HTTP ${res.status} — ${t.slice(0, 200)}` });
      } else {
        const body = await res.json();
        update(6, { status: 'ok', detail: `Devolveu ${JSON.stringify(body)}` });
      }
    } catch (e: any) {
      update(6, { status: 'fail', detail: e.message });
    }

    setRunning(false);
  };

  const okCount = checks.filter((c) => c.status === 'ok').length;
  const failCount = checks.filter((c) => c.status === 'fail').length;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Diagnóstico do site público</h1>
            <p className="text-sm text-muted-foreground">
              Verifica permissões (GRANTs + RLS) e simula as queries de um visitante anónimo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!running && (okCount > 0 || failCount > 0) && (
              <>
                <Badge variant="outline" className="border-green-600 text-green-700">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> {okCount} OK
                </Badge>
                {failCount > 0 && (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" /> {failCount} falhas
                  </Badge>
                )}
              </>
            )}
            <Button onClick={run} disabled={running}>
              {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlayCircle className="h-4 w-4 mr-2" />}
              Executar diagnóstico
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checks.map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-md border bg-card">
                <div className="mt-0.5">
                  {c.status === 'ok' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                  {c.status === 'fail' && <XCircle className="h-5 w-5 text-destructive" />}
                  {c.status === 'running' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                  {c.status === 'idle' && <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.description}</div>
                  {c.detail && (
                    <div className={`text-xs mt-1 break-words font-mono ${c.status === 'fail' ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {c.detail}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Como interpretar</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Cada teste é executado com a chave pública (anon) — sem sessão — para simular um visitante.</p>
            <p>• Se uma tabela falhar com <span className="font-mono">permission denied</span>, faltam GRANTs no schema public.</p>
            <p>• Se faltarem linhas, a tabela tem GRANT mas a política RLS está a filtrar tudo.</p>
            <p>• Recomendado correr antes de cada publicação.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
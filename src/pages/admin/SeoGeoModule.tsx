import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MultilingualTabs } from '@/components/admin/MultilingualTabs';
import { TagsInput } from '@/components/admin/TagsInput';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye, Globe, HelpCircle, Building2, X, Download, RefreshCw } from 'lucide-react';

// ── Types ──
interface SemanticStrategy {
  id: string;
  name: string;
  description: string | null;
  target_intent: string;
  primary_keywords: string[];
  secondary_keywords: string[];
  entities: string[];
  response_structure: string | null;
  is_active: boolean;
  order_index: number;
}

interface GeoFaq {
  id: string;
  strategy_id: string | null;
  question: Record<string, string>;
  answer: Record<string, string>;
  category: string | null;
  schema_enabled: boolean;
  order_index: number;
  is_active: boolean;
  page_reference: string;
}

interface GeoEntity {
  id: string;
  name: string;
  entity_type: string;
  description: string | null;
  properties: Record<string, string>;
  same_as: string[];
  schema_type: string;
  is_active: boolean;
  order_index: number;
}

// ── Strategies Tab ──
function StrategiesTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SemanticStrategy | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', target_intent: 'informational',
    primary_keywords: [] as string[], secondary_keywords: [] as string[],
    response_structure: '', is_active: true,
  });

  const { data: strategies = [], isLoading } = useQuery({
    queryKey: ['geo-strategies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('geo_semantic_strategies')
        .select('*').order('order_index');
      if (error) throw error;
      return (data || []).map((s: any) => ({
        ...s,
        primary_keywords: Array.isArray(s.primary_keywords) ? s.primary_keywords : [],
        secondary_keywords: Array.isArray(s.secondary_keywords) ? s.secondary_keywords : [],
        entities: Array.isArray(s.entities) ? s.entities : [],
      })) as SemanticStrategy[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description || null,
        target_intent: form.target_intent,
        primary_keywords: form.primary_keywords,
        secondary_keywords: form.secondary_keywords,
        response_structure: form.response_structure || null,
        is_active: form.is_active,
      };
      if (editing) {
        const { error } = await supabase.from('geo_semantic_strategies')
          .update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('geo_semantic_strategies')
          .insert({ ...payload, order_index: strategies.length });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geo-strategies'] });
      toast.success(editing ? 'Estratégia atualizada' : 'Estratégia criada');
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('geo_semantic_strategies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geo-strategies'] });
      toast.success('Estratégia eliminada');
    },
  });

  const resetForm = () => {
    setForm({ name: '', description: '', target_intent: 'informational', primary_keywords: [], secondary_keywords: [], response_structure: '', is_active: true });
    setEditing(null);
    setDialogOpen(false);
  };

  const openEdit = (s: SemanticStrategy) => {
    setEditing(s);
    setForm({
      name: s.name, description: s.description || '', target_intent: s.target_intent,
      primary_keywords: s.primary_keywords, secondary_keywords: s.secondary_keywords,
      response_structure: s.response_structure || '', is_active: s.is_active,
    });
    setDialogOpen(true);
  };

  const intentLabels: Record<string, string> = {
    informational: 'Informacional', transactional: 'Transacional', navigational: 'Navegacional',
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Estratégias Semânticas</h3>
          <p className="text-sm text-muted-foreground">Defina estratégias para otimização GEO (IA generativa)</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) resetForm(); setDialogOpen(o); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nova Estratégia</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar Estratégia' : 'Nova Estratégia'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Imobiliário Luxo Portugal" />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Intenção de Busca</Label>
                <Select value={form.target_intent} onValueChange={(v) => setForm({ ...form, target_intent: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="informational">Informacional</SelectItem>
                    <SelectItem value="transactional">Transacional</SelectItem>
                    <SelectItem value="navigational">Navegacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Keywords Primárias</Label>
                <TagsInput value={form.primary_keywords} onChange={(v) => setForm({ ...form, primary_keywords: v })} placeholder="Adicionar keyword..." />
              </div>
              <div>
                <Label>Keywords Secundárias</Label>
                <TagsInput value={form.secondary_keywords} onChange={(v) => setForm({ ...form, secondary_keywords: v })} placeholder="Adicionar keyword..." />
              </div>
              <div>
                <Label>Estrutura de Resposta para IA</Label>
                <Textarea value={form.response_structure} onChange={(e) => setForm({ ...form, response_structure: e.target.value })} rows={4} placeholder="Descreva como a IA deve estruturar as respostas..." />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Ativa</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button onClick={() => saveMutation.mutate()} disabled={!form.name || saveMutation.isPending}>
                  {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">A carregar...</p>
      ) : strategies.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhuma estratégia criada. Clique em "Nova Estratégia" para começar.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {strategies.map((s) => (
            <Card key={s.id}>
              <CardContent className="py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{s.name}</h4>
                    <Badge variant={s.is_active ? 'default' : 'secondary'}>{s.is_active ? 'Ativa' : 'Inativa'}</Badge>
                    <Badge variant="outline">{intentLabels[s.target_intent] || s.target_intent}</Badge>
                  </div>
                  {s.description && <p className="text-sm text-muted-foreground mb-2">{s.description}</p>}
                  <div className="flex flex-wrap gap-1">
                    {s.primary_keywords.map((k) => <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>)}
                    {s.secondary_keywords.map((k) => <Badge key={k} variant="outline" className="text-xs">{k}</Badge>)}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm('Eliminar esta estratégia?')) deleteMutation.mutate(s.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── FAQs Tab ──
function FaqsTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editing, setEditing] = useState<GeoFaq | null>(null);
  const [form, setForm] = useState({
    question: { pt: '', en: '', fr: '', de: '' },
    answer: { pt: '', en: '', fr: '', de: '' },
    category: '', schema_enabled: true, is_active: true, strategy_id: '' as string, page_reference: '',
  });

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['geo-faqs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('geo_faqs').select('*').order('order_index');
      if (error) throw error;
      return (data || []).map((f: any) => ({
        ...f,
        question: typeof f.question === 'object' ? f.question : {},
        answer: typeof f.answer === 'object' ? f.answer : {},
      })) as GeoFaq[];
    },
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ['geo-strategies'],
    queryFn: async () => {
      const { data } = await supabase.from('geo_semantic_strategies').select('id, name').order('name');
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        question: form.question,
        answer: form.answer,
        category: form.category || null,
        schema_enabled: form.schema_enabled,
        is_active: form.is_active,
        strategy_id: form.strategy_id || null,
        page_reference: form.page_reference,
      };
      if (editing) {
        const { error } = await supabase.from('geo_faqs').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('geo_faqs').insert({ ...payload, order_index: faqs.length });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geo-faqs'] });
      toast.success(editing ? 'FAQ atualizada' : 'FAQ criada');
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('geo_faqs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geo-faqs'] });
      toast.success('FAQ eliminada');
    },
  });

  const resetForm = () => {
    setForm({ question: { pt: '', en: '', fr: '', de: '' }, answer: { pt: '', en: '', fr: '', de: '' }, category: '', schema_enabled: true, is_active: true, strategy_id: '', page_reference: '' });
    setEditing(null);
    setDialogOpen(false);
  };

  const openEdit = (f: GeoFaq) => {
    setEditing(f);
    setForm({
      question: { pt: f.question?.pt || '', en: f.question?.en || '', fr: f.question?.fr || '', de: f.question?.de || '' },
      answer: { pt: f.answer?.pt || '', en: f.answer?.en || '', fr: f.answer?.fr || '', de: f.answer?.de || '' },
      category: f.category || '', schema_enabled: f.schema_enabled, is_active: f.is_active,
      strategy_id: f.strategy_id || '', page_reference: f.page_reference || '',
    });
    setDialogOpen(true);
  };

  const generateFaqSchema = (faqList: GeoFaq[]) => {
    const activeFaqs = faqList.filter(f => f.is_active && f.schema_enabled);
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": activeFaqs.map(f => ({
        "@type": "Question",
        "name": f.question?.pt || '',
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.answer?.pt || '',
        },
      })),
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">FAQs Estruturadas</h3>
          <p className="text-sm text-muted-foreground">FAQs multilingue com Schema FAQ automático</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline"><Eye className="h-4 w-4 mr-2" />Preview Schema</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>JSON-LD FAQPage Schema</DialogTitle></DialogHeader>
              <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-96">
                {JSON.stringify(generateFaqSchema(faqs), null, 2)}
              </pre>
            </DialogContent>
          </Dialog>
          <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) resetForm(); setDialogOpen(o); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nova FAQ</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editing ? 'Editar FAQ' : 'Nova FAQ'}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <MultilingualTabs value={form.question} onChange={(v, lang) => setForm({ ...form, question: { ...form.question, [lang]: v } })} type="input" label="Pergunta" required placeholder="A pergunta..." />
                <MultilingualTabs value={form.answer} onChange={(v, lang) => setForm({ ...form, answer: { ...form.answer, [lang]: v } })} type="textarea" label="Resposta" required placeholder="A resposta..." />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Categoria</Label>
                    <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Investimento" />
                  </div>
                  <div>
                    <Label>Página de Referência</Label>
                    <Input value={form.page_reference} onChange={(e) => setForm({ ...form, page_reference: e.target.value })} placeholder="Ex: /properties" />
                  </div>
                </div>
                <div>
                  <Label>Estratégia Associada</Label>
                  <Select value={form.strategy_id} onValueChange={(v) => setForm({ ...form, strategy_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma</SelectItem>
                      {strategies.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={form.schema_enabled} onCheckedChange={(v) => setForm({ ...form, schema_enabled: v })} />
                    <Label>Schema FAQ ativo</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                    <Label>Ativa</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                  <Button onClick={() => saveMutation.mutate()} disabled={!form.question.pt || saveMutation.isPending}>
                    {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">A carregar...</p>
      ) : faqs.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhuma FAQ criada.</CardContent></Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pergunta</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Schema</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqs.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="max-w-xs truncate">{f.question?.pt || '—'}</TableCell>
                <TableCell>{f.category || '—'}</TableCell>
                <TableCell><Badge variant={f.schema_enabled ? 'default' : 'outline'}>{f.schema_enabled ? 'Sim' : 'Não'}</Badge></TableCell>
                <TableCell><Badge variant={f.is_active ? 'default' : 'secondary'}>{f.is_active ? 'Ativa' : 'Inativa'}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm('Eliminar?')) deleteMutation.mutate(f.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// ── Entities Tab ──
function EntitiesTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewEntity, setPreviewEntity] = useState<GeoEntity | null>(null);
  const [editing, setEditing] = useState<GeoEntity | null>(null);
  const [form, setForm] = useState({
    name: '', entity_type: 'organization', description: '',
    properties: {} as Record<string, string>, same_as: [] as string[],
    schema_type: 'Organization', is_active: true,
  });
  const [newPropKey, setNewPropKey] = useState('');
  const [newPropVal, setNewPropVal] = useState('');

  const { data: entities = [], isLoading } = useQuery({
    queryKey: ['geo-entities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('geo_entities').select('*').order('order_index');
      if (error) throw error;
      return (data || []).map((e: any) => ({
        ...e,
        properties: typeof e.properties === 'object' && !Array.isArray(e.properties) ? e.properties : {},
        same_as: Array.isArray(e.same_as) ? e.same_as : [],
      })) as GeoEntity[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        entity_type: form.entity_type,
        description: form.description || null,
        properties: form.properties,
        same_as: form.same_as,
        schema_type: form.schema_type,
        is_active: form.is_active,
      };
      if (editing) {
        const { error } = await supabase.from('geo_entities').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('geo_entities').insert({ ...payload, order_index: entities.length });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geo-entities'] });
      toast.success(editing ? 'Entidade atualizada' : 'Entidade criada');
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('geo_entities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geo-entities'] });
      toast.success('Entidade eliminada');
    },
  });

  const resetForm = () => {
    setForm({ name: '', entity_type: 'organization', description: '', properties: {}, same_as: [], schema_type: 'Organization', is_active: true });
    setEditing(null);
    setDialogOpen(false);
  };

  const openEdit = (e: GeoEntity) => {
    setEditing(e);
    setForm({
      name: e.name, entity_type: e.entity_type, description: e.description || '',
      properties: { ...e.properties }, same_as: [...e.same_as],
      schema_type: e.schema_type, is_active: e.is_active,
    });
    setDialogOpen(true);
  };

  const addProperty = () => {
    if (newPropKey.trim()) {
      setForm({ ...form, properties: { ...form.properties, [newPropKey.trim()]: newPropVal } });
      setNewPropKey('');
      setNewPropVal('');
    }
  };

  const removeProperty = (key: string) => {
    const p = { ...form.properties };
    delete p[key];
    setForm({ ...form, properties: p });
  };

  const generateEntitySchema = (entity: GeoEntity) => {
    const schema: any = {
      "@context": "https://schema.org",
      "@type": entity.schema_type,
      "name": entity.name,
    };
    if (entity.description) schema.description = entity.description;
    Object.entries(entity.properties).forEach(([k, v]) => { schema[k] = v; });
    if (entity.same_as.length > 0) schema.sameAs = entity.same_as;
    return schema;
  };

  const entityTypes = [
    { value: 'organization', label: 'Organização', schema: 'Organization' },
    { value: 'person', label: 'Pessoa', schema: 'Person' },
    { value: 'product', label: 'Produto', schema: 'Product' },
    { value: 'service', label: 'Serviço', schema: 'Service' },
    { value: 'place', label: 'Lugar', schema: 'Place' },
    { value: 'real_estate', label: 'Imóvel', schema: 'RealEstateAgent' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Entidades</h3>
          <p className="text-sm text-muted-foreground">Entidades principais para reconhecimento por IA</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) resetForm(); setDialogOpen(o); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nova Entidade</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? 'Editar Entidade' : 'Nova Entidade'}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Genuíno Investments" />
              </div>
              <div>
                <Label>Tipo de Entidade</Label>
                <Select value={form.entity_type} onValueChange={(v) => {
                  const found = entityTypes.find(t => t.value === v);
                  setForm({ ...form, entity_type: v, schema_type: found?.schema || 'Thing' });
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {entityTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Schema.org Type</Label>
                <Input value={form.schema_type} onChange={(e) => setForm({ ...form, schema_type: e.target.value })} />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>

              {/* Properties */}
              <div>
                <Label>Propriedades</Label>
                <div className="space-y-2 mt-1">
                  {Object.entries(form.properties).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2">
                      <Badge variant="secondary">{k}</Badge>
                      <span className="text-sm truncate flex-1">{v}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeProperty(k)}><X className="h-3 w-3" /></Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input value={newPropKey} onChange={(e) => setNewPropKey(e.target.value)} placeholder="Chave" className="flex-1" />
                    <Input value={newPropVal} onChange={(e) => setNewPropVal(e.target.value)} placeholder="Valor" className="flex-1" />
                    <Button variant="outline" size="sm" onClick={addProperty} disabled={!newPropKey.trim()}>+</Button>
                  </div>
                </div>
              </div>

              {/* SameAs */}
              <div>
                <Label>URLs "sameAs"</Label>
                <TagsInput value={form.same_as} onChange={(v) => setForm({ ...form, same_as: v })} placeholder="https://pt.wikipedia.org/..." suggestions={['https://www.linkedin.com/', 'https://pt.wikipedia.org/', 'https://www.facebook.com/']} />
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Ativa</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button onClick={() => saveMutation.mutate()} disabled={!form.name || saveMutation.isPending}>
                  {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">A carregar...</p>
      ) : entities.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhuma entidade criada.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {entities.map((e) => (
            <Card key={e.id}>
              <CardContent className="py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{e.name}</h4>
                    <Badge variant={e.is_active ? 'default' : 'secondary'}>{e.is_active ? 'Ativa' : 'Inativa'}</Badge>
                    <Badge variant="outline">{e.schema_type}</Badge>
                  </div>
                  {e.description && <p className="text-sm text-muted-foreground mb-2">{e.description}</p>}
                  {Object.keys(e.properties).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(e.properties).slice(0, 5).map(([k, v]) => (
                        <Badge key={k} variant="outline" className="text-xs">{k}: {String(v).substring(0, 30)}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setPreviewEntity(e)}><Eye className="h-4 w-4" /></Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                      <DialogHeader><DialogTitle>Schema.org – {e.name}</DialogTitle></DialogHeader>
                      <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-96">
                        {JSON.stringify(generateEntitySchema(e), null, 2)}
                      </pre>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm('Eliminar?')) deleteMutation.mutate(e.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sitemap Generator ──
function SitemapGenerator() {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-sitemap');
      if (error) throw error;
      
      // data is the XML string
      const blob = new Blob([data], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Sitemap gerado e descarregado com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao gerar sitemap: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardContent className="py-4 flex items-center justify-between">
        <div>
          <h4 className="font-medium">Sitemap XML Dinâmico</h4>
          <p className="text-sm text-muted-foreground">Gera automaticamente o sitemap com todos os imóveis e páginas ativos</p>
        </div>
        <Button onClick={handleGenerate} disabled={generating} variant="outline">
          {generating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          {generating ? 'A gerar...' : 'Gerar Sitemap'}
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Main Page ──
export default function SeoGeoModule() {
  return (
    <AdminLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">GEO – Otimização para IA Generativa</h1>
          <p className="text-muted-foreground">Estratégias semânticas, FAQs estruturadas e entidades para motores de IA</p>
        </div>

        <SitemapGenerator />

        <Tabs defaultValue="strategies" className="space-y-4">
          <TabsList>
            <TabsTrigger value="strategies" className="gap-2"><Globe className="h-4 w-4" />Estratégias</TabsTrigger>
            <TabsTrigger value="faqs" className="gap-2"><HelpCircle className="h-4 w-4" />FAQs</TabsTrigger>
            <TabsTrigger value="entities" className="gap-2"><Building2 className="h-4 w-4" />Entidades</TabsTrigger>
          </TabsList>
          <TabsContent value="strategies"><StrategiesTab /></TabsContent>
          <TabsContent value="faqs"><FaqsTab /></TabsContent>
          <TabsContent value="entities"><EntitiesTab /></TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

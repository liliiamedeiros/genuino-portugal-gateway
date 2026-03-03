import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const FIELD_TYPES = [
  { value: 'text', label: 'Texto simples' },
  { value: 'textarea', label: 'Texto longo' },
  { value: 'wysiwyg', label: 'Editor WYSIWYG' },
  { value: 'toggle', label: 'Toggle (Sim/Não)' },
  { value: 'upload', label: 'Upload' },
  { value: 'html_code', label: 'Código HTML' },
  { value: 'json_ld', label: 'Código JSON-LD' },
  { value: 'number', label: 'Numérico' },
  { value: 'url', label: 'URL' },
  { value: 'domain', label: 'Domínio' },
  { value: 'api_integration', label: 'Integração API' },
];

const IMPACT_LEVELS = [
  { value: 'low', label: 'Baixo' },
  { value: 'medium', label: 'Médio' },
  { value: 'high', label: 'Alto' },
];

const RULE_OPERATORS = [
  { value: 'lt', label: '< Menor que' },
  { value: 'gt', label: '> Maior que' },
  { value: 'eq', label: '= Igual a' },
  { value: 'contains', label: 'Contém' },
  { value: 'not_exists', label: 'Não existe' },
  { value: 'length_lt', label: 'Comprimento < que' },
  { value: 'length_gt', label: 'Comprimento > que' },
];

const RULE_RESULTS = [
  { value: 'warning', label: 'Aviso' },
  { value: 'needs_improvement', label: 'Precisa melhorar' },
  { value: 'critical', label: 'Crítico' },
];

// === STAGES TAB ===
function StagesTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', importance_weight: '1', min_completion_pct: '100', requires_previous_complete: false });

  const { data: stages } = useQuery({
    queryKey: ['seo-stages-config'],
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_stages').select('*').order('order_index');
      if (error) throw error;
      return data;
    },
  });

  const logHistory = async (entityType: string, entityId: string, action: string, oldVal: any, newVal: any) => {
    await supabase.from('seo_history').insert({
      user_id: user?.id, entity_type: entityType, entity_id: entityId,
      action, old_value: oldVal, new_value: newVal,
    });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description || null,
        importance_weight: parseFloat(form.importance_weight) || 1,
        min_completion_pct: parseFloat(form.min_completion_pct) || 100,
        requires_previous_complete: form.requires_previous_complete,
        order_index: editing ? editing.order_index : (stages?.length || 0),
      };
      if (editing) {
        const { error } = await supabase.from('seo_stages').update(payload).eq('id', editing.id);
        if (error) throw error;
        await logHistory('stage', editing.id, 'update', editing, payload);
      } else {
        const { data, error } = await supabase.from('seo_stages').insert(payload).select().single();
        if (error) throw error;
        await logHistory('stage', data.id, 'create', null, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-stages-config'] });
      toast({ title: editing ? 'Etapa atualizada' : 'Etapa criada' });
      setOpen(false);
      resetForm();
    },
    onError: () => toast({ title: 'Erro ao guardar', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const stage = stages?.find(s => s.id === id);
      const { error } = await supabase.from('seo_stages').delete().eq('id', id);
      if (error) throw error;
      await logHistory('stage', id, 'delete', stage, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-stages-config'] });
      toast({ title: 'Etapa eliminada' });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('seo_stages').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seo-stages-config'] }),
  });

  const resetForm = () => {
    setForm({ name: '', description: '', importance_weight: '1', min_completion_pct: '100', requires_previous_complete: false });
    setEditing(null);
  };

  const openEdit = (stage: any) => {
    setEditing(stage);
    setForm({
      name: stage.name,
      description: stage.description || '',
      importance_weight: String(stage.importance_weight),
      min_completion_pct: String(stage.min_completion_pct),
      requires_previous_complete: stage.requires_previous_complete,
    });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Etapas</h3>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Etapa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar Etapa' : 'Nova Etapa'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Peso de importância</Label>
                  <Input type="number" value={form.importance_weight} onChange={e => setForm(f => ({ ...f, importance_weight: e.target.value }))} />
                </div>
                <div>
                  <Label>Meta mínima (%)</Label>
                  <Input type="number" value={form.min_completion_pct} onChange={e => setForm(f => ({ ...f, min_completion_pct: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.requires_previous_complete} onCheckedChange={c => setForm(f => ({ ...f, requires_previous_complete: c }))} />
                <Label>Exigir etapa anterior completa</Label>
              </div>
              <Button onClick={() => saveMutation.mutate()} disabled={!form.name.trim()} className="w-full">
                {editing ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {stages?.map(stage => (
        <Card key={stage.id}>
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{stage.name}</p>
                <p className="text-xs text-muted-foreground">
                  Peso: {stage.importance_weight} | Meta: {stage.min_completion_pct}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={stage.is_active} onCheckedChange={c => toggleActive.mutate({ id: stage.id, is_active: c })} />
              <Button size="icon" variant="ghost" onClick={() => openEdit(stage)}><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(stage.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// === QUESTIONS TAB ===
function QuestionsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    stage_id: '', label: '', description: '', field_type: 'text',
    is_required: false, weight: '1', seo_impact: 'medium',
    min_chars: '', max_chars: '', validation_regex: '',
    error_message: '', success_message: '',
  });

  const { data: stages } = useQuery({
    queryKey: ['seo-stages-config'],
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_stages').select('*').order('order_index');
      if (error) throw error;
      return data;
    },
  });

  const { data: questions } = useQuery({
    queryKey: ['seo-questions-config'],
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_questions').select('*').order('order_index');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        stage_id: form.stage_id,
        label: form.label,
        description: form.description || null,
        field_type: form.field_type as any,
        is_required: form.is_required,
        weight: parseFloat(form.weight) || 1,
        seo_impact: form.seo_impact as any,
        min_chars: form.min_chars ? parseInt(form.min_chars) : null,
        max_chars: form.max_chars ? parseInt(form.max_chars) : null,
        validation_regex: form.validation_regex || null,
        error_message: form.error_message || null,
        success_message: form.success_message || null,
        order_index: editing ? editing.order_index : (questions?.filter(q => q.stage_id === form.stage_id).length || 0),
      };
      if (editing) {
        const { error } = await supabase.from('seo_questions').update(payload).eq('id', editing.id);
        if (error) throw error;
        await supabase.from('seo_history').insert({ user_id: user?.id, entity_type: 'question', entity_id: editing.id, action: 'update', old_value: editing, new_value: payload });
      } else {
        const { data, error } = await supabase.from('seo_questions').insert(payload).select().single();
        if (error) throw error;
        await supabase.from('seo_history').insert({ user_id: user?.id, entity_type: 'question', entity_id: data.id, action: 'create', old_value: null, new_value: payload });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-questions-config'] });
      toast({ title: editing ? 'Pergunta atualizada' : 'Pergunta criada' });
      setOpen(false);
      resetForm();
    },
    onError: () => toast({ title: 'Erro ao guardar', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('seo_questions').delete().eq('id', id);
      if (error) throw error;
      await supabase.from('seo_history').insert({ user_id: user?.id, entity_type: 'question', entity_id: id, action: 'delete', old_value: null, new_value: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-questions-config'] });
      toast({ title: 'Pergunta eliminada' });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('seo_questions').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seo-questions-config'] }),
  });

  const resetForm = () => {
    setForm({ stage_id: '', label: '', description: '', field_type: 'text', is_required: false, weight: '1', seo_impact: 'medium', min_chars: '', max_chars: '', validation_regex: '', error_message: '', success_message: '' });
    setEditing(null);
  };

  const openEdit = (q: any) => {
    setEditing(q);
    setForm({
      stage_id: q.stage_id, label: q.label, description: q.description || '', field_type: q.field_type,
      is_required: q.is_required, weight: String(q.weight), seo_impact: q.seo_impact,
      min_chars: q.min_chars ? String(q.min_chars) : '', max_chars: q.max_chars ? String(q.max_chars) : '',
      validation_regex: q.validation_regex || '', error_message: q.error_message || '', success_message: q.success_message || '',
    });
    setOpen(true);
  };

  const groupedByStage = stages?.map(stage => ({
    ...stage,
    questions: questions?.filter(q => q.stage_id === stage.id) || [],
  })) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Perguntas</h3>
        <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Pergunta</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar Pergunta' : 'Nova Pergunta'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Etapa</Label>
                <Select value={form.stage_id} onValueChange={v => setForm(f => ({ ...f, stage_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma etapa" /></SelectTrigger>
                  <SelectContent>
                    {stages?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Label</Label>
                <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de campo</Label>
                  <Select value={form.field_type} onValueChange={v => setForm(f => ({ ...f, field_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map(ft => <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Impacto SEO</Label>
                  <Select value={form.seo_impact} onValueChange={v => setForm(f => ({ ...f, seo_impact: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {IMPACT_LEVELS.map(il => <SelectItem key={il.value} value={il.value}>{il.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Peso</Label>
                  <Input type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
                </div>
                <div>
                  <Label>Mín. caracteres</Label>
                  <Input type="number" value={form.min_chars} onChange={e => setForm(f => ({ ...f, min_chars: e.target.value }))} />
                </div>
                <div>
                  <Label>Máx. caracteres</Label>
                  <Input type="number" value={form.max_chars} onChange={e => setForm(f => ({ ...f, max_chars: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Regex de validação</Label>
                <Input value={form.validation_regex} onChange={e => setForm(f => ({ ...f, validation_regex: e.target.value }))} placeholder="Ex: ^https?://" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Msg erro</Label>
                  <Input value={form.error_message} onChange={e => setForm(f => ({ ...f, error_message: e.target.value }))} />
                </div>
                <div>
                  <Label>Msg sucesso</Label>
                  <Input value={form.success_message} onChange={e => setForm(f => ({ ...f, success_message: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_required} onCheckedChange={c => setForm(f => ({ ...f, is_required: c }))} />
                <Label>Obrigatório</Label>
              </div>
              <Button onClick={() => saveMutation.mutate()} disabled={!form.label.trim() || !form.stage_id} className="w-full">
                {editing ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {groupedByStage.map(stage => (
        <div key={stage.id} className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">{stage.name}</h4>
          {stage.questions.length === 0 && <p className="text-xs text-muted-foreground pl-4">Sem perguntas</p>}
          {stage.questions.map((q: any) => (
            <Card key={q.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{q.label}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{FIELD_TYPES.find(f => f.value === q.field_type)?.label}</Badge>
                      <Badge variant={q.seo_impact === 'high' ? 'destructive' : q.seo_impact === 'medium' ? 'default' : 'secondary'} className="text-xs">
                        {IMPACT_LEVELS.find(i => i.value === q.seo_impact)?.label}
                      </Badge>
                      {q.is_required && <Badge className="text-xs">Obrigatório</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={q.is_active} onCheckedChange={c => toggleActive.mutate({ id: q.id, is_active: c })} />
                  <Button size="icon" variant="ghost" onClick={() => openEdit(q)}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}

// === RULES TAB ===
function RulesTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: '', condition_field: '', condition_operator: 'eq',
    condition_value: '', result_status: 'warning', result_message: '',
  });

  const { data: rules } = useQuery({
    queryKey: ['seo-rules-config'],
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_rules').select('*').order('order_index');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        condition_field: form.condition_field,
        condition_operator: form.condition_operator as any,
        condition_value: form.condition_value,
        result_status: form.result_status as any,
        result_message: form.result_message,
        order_index: editing ? editing.order_index : (rules?.length || 0),
      };
      if (editing) {
        const { error } = await supabase.from('seo_rules').update(payload).eq('id', editing.id);
        if (error) throw error;
        await supabase.from('seo_history').insert({ user_id: user?.id, entity_type: 'rule', entity_id: editing.id, action: 'update', old_value: editing, new_value: payload });
      } else {
        const { data, error } = await supabase.from('seo_rules').insert(payload).select().single();
        if (error) throw error;
        await supabase.from('seo_history').insert({ user_id: user?.id, entity_type: 'rule', entity_id: data.id, action: 'create', old_value: null, new_value: payload });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-rules-config'] });
      toast({ title: editing ? 'Regra atualizada' : 'Regra criada' });
      setOpen(false);
      resetForm();
    },
    onError: () => toast({ title: 'Erro ao guardar', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('seo_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-rules-config'] });
      toast({ title: 'Regra eliminada' });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('seo_rules').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seo-rules-config'] }),
  });

  const resetForm = () => {
    setForm({ name: '', condition_field: '', condition_operator: 'eq', condition_value: '', result_status: 'warning', result_message: '' });
    setEditing(null);
  };

  const openEdit = (rule: any) => {
    setEditing(rule);
    setForm({
      name: rule.name, condition_field: rule.condition_field, condition_operator: rule.condition_operator,
      condition_value: rule.condition_value, result_status: rule.result_status, result_message: rule.result_message,
    });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Regras Condicionais</h3>
        <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Regra</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar Regra' : 'Nova Regra'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Campo de condição</Label><Input value={form.condition_field} onChange={e => setForm(f => ({ ...f, condition_field: e.target.value }))} placeholder="Ex: meta_description" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Operador</Label>
                  <Select value={form.condition_operator} onValueChange={v => setForm(f => ({ ...f, condition_operator: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{RULE_OPERATORS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Valor</Label><Input value={form.condition_value} onChange={e => setForm(f => ({ ...f, condition_value: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status resultado</Label>
                  <Select value={form.result_status} onValueChange={v => setForm(f => ({ ...f, result_status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{RULE_RESULTS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Mensagem</Label><Input value={form.result_message} onChange={e => setForm(f => ({ ...f, result_message: e.target.value }))} /></div>
              </div>
              <Button onClick={() => saveMutation.mutate()} disabled={!form.name.trim() || !form.condition_field.trim()} className="w-full">
                {editing ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {rules?.map(rule => (
        <Card key={rule.id}>
          <CardContent className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-sm">{rule.name}</p>
              <p className="text-xs text-muted-foreground">
                SE <code>{rule.condition_field}</code> {RULE_OPERATORS.find(o => o.value === rule.condition_operator)?.label} <code>{rule.condition_value}</code>
                → <Badge variant={rule.result_status === 'critical' ? 'destructive' : 'default'} className="text-xs ml-1">
                  {RULE_RESULTS.find(r => r.value === rule.result_status)?.label}
                </Badge>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={rule.is_active} onCheckedChange={c => toggleActive.mutate({ id: rule.id, is_active: c })} />
              <Button size="icon" variant="ghost" onClick={() => openEdit(rule)}><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(rule.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {!rules?.length && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma regra configurada.</p>}
    </div>
  );
}

// === MAIN PAGE ===
export default function SeoConfig() {
  return (
    <AdminLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configuração SEO</h1>
          <p className="text-muted-foreground">Gerir etapas, perguntas e regras</p>
        </div>
        <Tabs defaultValue="stages">
          <TabsList>
            <TabsTrigger value="stages">Etapas</TabsTrigger>
            <TabsTrigger value="questions">Perguntas</TabsTrigger>
            <TabsTrigger value="rules">Regras</TabsTrigger>
          </TabsList>
          <TabsContent value="stages"><StagesTab /></TabsContent>
          <TabsContent value="questions"><QuestionsTab /></TabsContent>
          <TabsContent value="rules"><RulesTab /></TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

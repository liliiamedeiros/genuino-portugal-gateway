import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertTriangle, XCircle, Save } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';

interface Stage {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  importance_weight: number;
  is_active: boolean;
}

interface Question {
  id: string;
  stage_id: string;
  label: string;
  description: string | null;
  field_type: string;
  is_required: boolean;
  weight: number;
  seo_impact: string;
  min_chars: number | null;
  max_chars: number | null;
  order_index: number;
  is_active: boolean;
  error_message: string | null;
  success_message: string | null;
}

interface Response {
  id: string;
  question_id: string;
  page_reference: string;
  value: unknown;
  status: string;
}

export default function SeoChecklist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editedValues, setEditedValues] = useState<Record<string, unknown>>({});

  const { data: stages } = useQuery({
    queryKey: ['seo-stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_stages')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      if (error) throw error;
      return data as Stage[];
    },
  });

  const { data: questions } = useQuery({
    queryKey: ['seo-questions-full'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_questions')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      if (error) throw error;
      return data as Question[];
    },
  });

  const { data: responses } = useQuery({
    queryKey: ['seo-responses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_responses')
        .select('*');
      if (error) throw error;
      return data as Response[];
    },
  });

  const responseMap = useMemo(() => {
    if (!responses) return new Map<string, Response>();
    return new Map(responses.map(r => [r.question_id, r]));
  }, [responses]);

  const saveMutation = useMutation({
    mutationFn: async ({ questionId, value }: { questionId: string; value: unknown }) => {
      const existing = responseMap.get(questionId);
      const status = value && String(value).trim() !== '' ? 'complete' : 'incomplete';
      
      if (existing) {
        const { error } = await supabase
          .from('seo_responses')
          .update({ value: JSON.stringify(value), status, updated_by: user?.id })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('seo_responses')
          .insert({
            question_id: questionId,
            page_reference: '',
            value: JSON.stringify(value),
            status,
            updated_by: user?.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-responses'] });
      toast({ title: 'Guardado com sucesso' });
    },
    onError: () => {
      toast({ title: 'Erro ao guardar', variant: 'destructive' });
    },
  });

  const handleSave = useCallback((questionId: string) => {
    const value = editedValues[questionId];
    if (value !== undefined) {
      saveMutation.mutate({ questionId, value });
    }
  }, [editedValues, saveMutation]);

  const getValue = (questionId: string): string => {
    if (editedValues[questionId] !== undefined) return String(editedValues[questionId]);
    const resp = responseMap.get(questionId);
    if (!resp?.value) return '';
    try {
      const parsed = typeof resp.value === 'string' ? JSON.parse(resp.value) : resp.value;
      return String(parsed);
    } catch {
      return String(resp.value);
    }
  };

  const getStatusIcon = (questionId: string) => {
    const resp = responseMap.get(questionId);
    if (!resp) return <XCircle className="h-4 w-4 text-muted-foreground" />;
    if (resp.status === 'complete') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (resp.status === 'critical') return <XCircle className="h-4 w-4 text-destructive" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStageProgress = (stageId: string) => {
    if (!questions) return 0;
    const stageQs = questions.filter(q => q.stage_id === stageId);
    const totalWeight = stageQs.reduce((s, q) => s + Number(q.weight), 0);
    if (totalWeight === 0) return 0;
    const completedWeight = stageQs.reduce((s, q) => {
      const resp = responseMap.get(q.id);
      return resp?.status === 'complete' ? s + Number(q.weight) : s;
    }, 0);
    return Math.round((completedWeight / totalWeight) * 100);
  };

  const renderField = (question: Question) => {
    const value = getValue(question.id);
    const onChange = (val: string) => setEditedValues(prev => ({ ...prev, [question.id]: val }));
    const hasEdited = editedValues[question.id] !== undefined;

    const charInfo = question.max_chars ? (
      <span className={`text-xs ${value.length > question.max_chars ? 'text-destructive' : 'text-muted-foreground'}`}>
        {value.length}/{question.max_chars}
      </span>
    ) : null;

    switch (question.field_type) {
      case 'toggle':
        return (
          <div className="flex items-center gap-3">
            <Switch
              checked={value === 'true'}
              onCheckedChange={(checked) => {
                setEditedValues(prev => ({ ...prev, [question.id]: String(checked) }));
              }}
            />
            <span className="text-sm">{value === 'true' ? 'Ativo' : 'Inativo'}</span>
          </div>
        );
      case 'textarea':
      case 'wysiwyg':
        return (
          <div>
            <Textarea
              value={value}
              onChange={e => onChange(e.target.value)}
              rows={4}
              placeholder={question.description || ''}
              className={hasEdited ? 'border-primary' : ''}
            />
            {charInfo}
          </div>
        );
      case 'html_code':
      case 'json_ld':
        return (
          <div>
            <Textarea
              value={value}
              onChange={e => onChange(e.target.value)}
              rows={6}
              className={`font-mono text-sm ${hasEdited ? 'border-primary' : ''}`}
              placeholder={question.field_type === 'json_ld' ? '{"@context": "https://schema.org", ...}' : '<meta ...>'}
            />
            {charInfo}
          </div>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={question.description || ''}
            className={hasEdited ? 'border-primary' : ''}
          />
        );
      case 'url':
      case 'domain':
        return (
          <Input
            type="url"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={question.field_type === 'url' ? 'https://...' : 'example.com'}
            className={hasEdited ? 'border-primary' : ''}
          />
        );
      default:
        return (
          <div>
            <Input
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder={question.description || ''}
              className={hasEdited ? 'border-primary' : ''}
            />
            {charInfo}
          </div>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Checklist SEO</h1>
          <p className="text-muted-foreground">Preencha e acompanhe as configurações SEO</p>
        </div>

        {!stages?.length ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma etapa configurada. Configure em{' '}
              <a href="/admin/seo/config" className="text-primary underline">Configuração</a>.
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {stages.map(stage => {
              const stageQuestions = questions?.filter(q => q.stage_id === stage.id) || [];
              const progress = getStageProgress(stage.id);

              return (
                <AccordionItem key={stage.id} value={stage.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex-1 text-left">
                        <div className="font-medium">{stage.name}</div>
                        {stage.description && (
                          <p className="text-xs text-muted-foreground">{stage.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{progress}%</span>
                        <Progress value={progress} className="w-24" />
                        {progress === 100 ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {stageQuestions.map(question => (
                        <div key={question.id} className="border rounded-md p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(question.id)}
                              <span className="font-medium text-sm">{question.label}</span>
                              {question.is_required && (
                                <Badge variant="outline" className="text-xs">Obrigatório</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  question.seo_impact === 'high'
                                    ? 'destructive'
                                    : question.seo_impact === 'medium'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {question.seo_impact === 'high' ? 'Alto' : question.seo_impact === 'medium' ? 'Médio' : 'Baixo'}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSave(question.id)}
                                disabled={editedValues[question.id] === undefined}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {question.description && (
                            <p className="text-xs text-muted-foreground">{question.description}</p>
                          )}
                          {renderField(question)}
                        </div>
                      ))}
                      {stageQuestions.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhuma pergunta nesta etapa.
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </AdminLayout>
  );
}

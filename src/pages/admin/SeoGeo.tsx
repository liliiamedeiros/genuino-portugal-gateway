import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  BarChart3, CheckCircle, AlertTriangle, XCircle, 
  ArrowRight, TrendingUp 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

interface StageRow {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  importance_weight: number;
  is_active: boolean;
}

interface QuestionRow {
  id: string;
  stage_id: string;
  weight: number;
  is_active: boolean;
}

interface ResponseRow {
  question_id: string;
  status: string;
  value: unknown;
}

export default function SeoGeo() {
  const { data: stages } = useQuery({
    queryKey: ['seo-stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_stages')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      if (error) throw error;
      return data as StageRow[];
    },
  });

  const { data: questions } = useQuery({
    queryKey: ['seo-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_questions')
        .select('id, stage_id, weight, is_active')
        .eq('is_active', true);
      if (error) throw error;
      return data as QuestionRow[];
    },
  });

  const { data: responses } = useQuery({
    queryKey: ['seo-responses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_responses')
        .select('question_id, status, value');
      if (error) throw error;
      return data as ResponseRow[];
    },
  });

  const stageProgress = useMemo(() => {
    if (!stages || !questions || !responses) return [];
    const responseMap = new Map(responses.map(r => [r.question_id, r]));

    return stages.map(stage => {
      const stageQuestions = questions.filter(q => q.stage_id === stage.id);
      const totalWeight = stageQuestions.reduce((sum, q) => sum + Number(q.weight), 0);
      const completedWeight = stageQuestions.reduce((sum, q) => {
        const resp = responseMap.get(q.id);
        if (resp && resp.status === 'complete') return sum + Number(q.weight);
        return sum;
      }, 0);
      const progress = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
      const criticalCount = stageQuestions.filter(q => {
        const resp = responseMap.get(q.id);
        return resp?.status === 'critical';
      }).length;

      return {
        ...stage,
        progress: Math.round(progress),
        totalQuestions: stageQuestions.length,
        completedQuestions: stageQuestions.filter(q => responseMap.get(q.id)?.status === 'complete').length,
        criticalCount,
      };
    });
  }, [stages, questions, responses]);

  const overallScore = useMemo(() => {
    if (!stageProgress.length) return 0;
    const totalWeight = stageProgress.reduce((sum, s) => sum + Number(s.importance_weight), 0);
    if (totalWeight === 0) return 0;
    const weightedSum = stageProgress.reduce(
      (sum, s) => sum + s.progress * Number(s.importance_weight),
      0
    );
    return Math.round(weightedSum / totalWeight);
  }, [stageProgress]);

  const totalCritical = stageProgress.reduce((sum, s) => sum + s.criticalCount, 0);

  const scoreColor = overallScore >= 80 ? 'text-green-500' : overallScore >= 50 ? 'text-yellow-500' : 'text-red-500';

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SEO & GEO – Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do progresso SEO</p>
          </div>
          <Link to="/admin/seo/checklist">
            <Button>
              Ir para Checklist <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Score Card */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Score Geral</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${scoreColor}`}>{overallScore}%</div>
              <Progress value={overallScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Etapas</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stageProgress.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stageProgress.filter(s => s.progress === 100).length} concluídas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Erros Críticos</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${totalCritical > 0 ? 'text-destructive' : 'text-green-500'}`}>
                {totalCritical}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalCritical === 0 ? 'Nenhum erro crítico' : 'Requer atenção imediata'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stage Progress Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Progresso por Etapa</h2>
          {stageProgress.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>Nenhuma etapa configurada.</p>
                <Link to="/admin/seo/config" className="text-primary underline mt-2 inline-block">
                  Configurar etapas →
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {stageProgress.map(stage => (
                <Card key={stage.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {stage.criticalCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {stage.criticalCount} crítico{stage.criticalCount > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {stage.progress === 100 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : stage.progress >= 50 ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={stage.progress} className="mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{stage.completedQuestions}/{stage.totalQuestions} perguntas</span>
                      <span className="font-medium">{stage.progress}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

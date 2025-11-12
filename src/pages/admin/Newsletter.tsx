import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  Users,
  Mail,
  MousePointerClick,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { CSVImporter } from '@/components/admin/CSVImporter';
import { TagsInput } from '@/components/admin/TagsInput';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const subscriberSchema = z.object({
  email: z.string().email('Email inválido'),
  full_name: z.string().optional(),
  language: z.enum(['pt', 'fr', 'en', 'de']).default('pt'),
  status: z.enum(['active', 'unsubscribed', 'bounced']).default('active'),
  tags: z.array(z.string()).optional(),
  source: z.string().default('manual'),
});

type SubscriberFormData = z.infer<typeof subscriberSchema>;

export default function Newsletter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [campaignStatusFilter, setCampaignStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<SubscriberFormData>({
    resolver: zodResolver(subscriberSchema),
    defaultValues: {
      language: 'pt',
      status: 'active',
      source: 'manual',
      tags: [],
    },
  });

  // Query para subscritores
  const { data: subscribers } = useQuery({
    queryKey: ['newsletter-subscribers', statusFilter, languageFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      if (languageFilter !== 'all') query = query.eq('language', languageFilter);
      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Query para campanhas
  const { data: campaigns } = useQuery({
    queryKey: ['newsletter-campaigns', campaignStatusFilter],
    queryFn: async () => {
      let query = supabase
        .from('newsletter_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignStatusFilter !== 'all') {
        query = query.eq('status', campaignStatusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Mutation para criar subscritor
  const createSubscriberMutation = useMutation({
    mutationFn: async (data: SubscriberFormData) => {
      const subscriberData = {
        email: data.email,
        full_name: data.full_name || null,
        language: data.language,
        status: data.status,
        tags: data.tags || [],
        source: data.source,
      };
      const { error } = await supabase.from('newsletter_subscribers').insert([subscriberData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
      toast.success('Subscritor adicionado com sucesso');
      setIsDialogOpen(false);
      reset();
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Este email já está registrado');
      } else {
        toast.error('Erro ao adicionar subscritor');
      }
    },
  });

  // Mutation para importar CSV
  const importSubscribersMutation = useMutation({
    mutationFn: async (subscribers: any[]) => {
      const { error } = await supabase.from('newsletter_subscribers').insert(subscribers);
      if (error) throw error;
      return subscribers.length;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
      toast.success('Subscritores importados com sucesso');
    },
    onError: () => {
      toast.error('Erro ao importar subscritores');
    },
  });

  const onSubmit = (data: SubscriberFormData) => {
    createSubscriberMutation.mutate(data);
  };

  const exportSubscribers = () => {
    if (!subscribers) return;

    const csv = [
      ['Email', 'Nome', 'Idioma', 'Status', 'Origem', 'Data'].join(','),
      ...subscribers.map((s) => [
        s.email,
        s.full_name || '',
        s.language,
        s.status,
        s.source || '',
        format(new Date(s.subscribed_at), 'dd/MM/yyyy'),
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Lista exportada com sucesso');
  };

  const languageLabels: Record<string, string> = {
    pt: 'Português',
    fr: 'Français',
    en: 'English',
    de: 'Deutsch',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Newsletter</h1>
            <p className="text-muted-foreground">Gerencie subscritores e campanhas</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="subscribers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="subscribers">
              Subscritores ({subscribers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="campaigns">
              Campanhas ({campaigns?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Subscritores */}
          <TabsContent value="subscribers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Subscritores</CardTitle>
                  <div className="flex gap-2">
                    <CSVImporter
                      onImport={async (data) => {
                        importSubscribersMutation.mutate(data);
                      }}
                      columns={[
                        { key: 'email', label: 'Email', required: true },
                        { key: 'full_name', label: 'Nome' },
                        { key: 'language', label: 'Idioma' },
                      ]}
                    />
                    <Button variant="outline" onClick={exportSubscribers}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Subscritor</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="email@exemplo.com"
                              {...register('email')}
                            />
                            {errors.email && (
                              <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="full_name">Nome Completo</Label>
                            <Input
                              id="full_name"
                              placeholder="Nome do subscritor"
                              {...register('full_name')}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Idioma Preferido *</Label>
                            <Select
                              value={watch('language')}
                              onValueChange={(value: any) => setValue('language', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pt">Português</SelectItem>
                                <SelectItem value="fr">Français</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="de">Deutsch</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Tags</Label>
                            <TagsInput
                              value={watch('tags') || []}
                              onChange={(tags) => setValue('tags', tags)}
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsDialogOpen(false)}
                            >
                              Cancelar
                            </Button>
                            <Button type="submit" disabled={createSubscriberMutation.isPending}>
                              {createSubscriberMutation.isPending ? 'Salvando...' : 'Salvar'}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Pesquisar por email ou nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="unsubscribed">Cancelado</SelectItem>
                      <SelectItem value="bounced">Bounce</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={languageFilter} onValueChange={setLanguageFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tabela */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Idioma</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers?.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                        <TableCell>{subscriber.full_name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {languageLabels[subscriber.language]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={subscriber.status} type="newsletter" />
                        </TableCell>
                        <TableCell>{subscriber.source || 'manual'}</TableCell>
                        <TableCell>
                          {format(new Date(subscriber.subscribed_at), 'dd/MM/yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Campanhas */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <Select value={campaignStatusFilter} onValueChange={setCampaignStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="sent">Enviada</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => navigate('/admin/newsletter/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Campanha
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns?.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-2">
                        {typeof campaign.subject === 'object' && campaign.subject !== null && 'pt' in campaign.subject 
                          ? (campaign.subject as any).pt 
                          : 'Sem assunto'}
                      </CardTitle>
                      <StatusBadge status={campaign.status} type="campaign" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{campaign.total_recipients || 0} destinatários</span>
                      </div>

                      {campaign.status === 'sent' && (
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Taxa de abertura:{' '}
                              {campaign.total_recipients > 0
                                ? ((campaign.opened_count / campaign.total_recipients) * 100).toFixed(1)
                                : '0'}
                              %
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Taxa de cliques:{' '}
                              {campaign.total_recipients > 0
                                ? ((campaign.clicked_count / campaign.total_recipients) * 100).toFixed(1)
                                : '0'}
                              %
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Enviada em {format(new Date(campaign.sent_at), "dd/MM/yyyy 'às' HH:mm")}
                          </div>
                        </>
                      )}

                      {campaign.status === 'scheduled' && campaign.scheduled_at && (
                        <div className="text-sm text-orange-600">
                          Agendada para{' '}
                          {format(new Date(campaign.scheduled_at), "dd/MM/yyyy 'às' HH:mm")}
                        </div>
                      )}

                      {campaign.status === 'draft' && (
                        <div className="text-sm text-muted-foreground">
                          Rascunho criado em{' '}
                          {format(new Date(campaign.created_at), 'dd/MM/yyyy')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/newsletter/edit/${campaign.id}`)}
                      className="flex-1"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {campaign.status === 'draft' ? 'Editar' : 'Ver Detalhes'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {(!campaigns || campaigns.length === 0) && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <p className="text-muted-foreground mb-4">Nenhuma campanha criada</p>
                  <Button onClick={() => navigate('/admin/newsletter/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar primeira campanha
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

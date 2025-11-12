import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  Edit,
  Archive,
  Calendar as CalendarIcon,
  Mail,
  Phone,
  MapPin,
  Tag,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ActivityTimeline } from '@/components/admin/ActivityTimeline';
import { AppointmentCard } from '@/components/admin/AppointmentCard';
import { PropertyInterestCard } from '@/components/admin/PropertyInterestCard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query para dados do cliente
  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Query para agendamentos do cliente
  const { data: appointments } = useQuery({
    queryKey: ['client-appointments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          projects:property_id(id, title_pt, location, main_image, price)
        `)
        .eq('client_id', id)
        .order('appointment_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Query para atividades do cliente
  const { data: activities } = useQuery({
    queryKey: ['client-activities', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('entity_type', 'client')
        .eq('entity_id', id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Query para imóveis relacionados
  const { data: relatedProperties } = useQuery({
    queryKey: ['client-properties', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          property_id,
          appointment_type,
          status,
          projects:property_id(*)
        `)
        .eq('client_id', id)
        .not('property_id', 'is', null);
      if (error) throw error;

      // Remover duplicatas de imóveis
      const uniqueProperties = Array.from(
        new Map(data.map((item: any) => [item.projects?.id, item])).values()
      );
      return uniqueProperties;
    },
  });

  // Estatísticas
  const stats = {
    totalAppointments: appointments?.length || 0,
    scheduled: appointments?.filter((a: any) => a.status === 'scheduled' || a.status === 'confirmed').length || 0,
    completed: appointments?.filter((a: any) => a.status === 'completed').length || 0,
    cancelled: appointments?.filter((a: any) => a.status === 'cancelled').length || 0,
  };

  const upcomingAppointments = appointments?.filter(
    (a: any) => new Date(a.appointment_date) >= new Date() && (a.status === 'scheduled' || a.status === 'confirmed')
  ).slice(0, 3);

  if (clientLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!client) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Cliente não encontrado</p>
            <Button onClick={() => navigate('/admin/clients')}>Voltar à lista</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const typeLabels: Record<string, string> = {
    buyer: 'Comprador',
    investor: 'Investidor',
    partner: 'Parceiro',
    lead: 'Lead',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/clients')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{client.full_name}</h1>
              <p className="text-muted-foreground">Detalhes do cliente</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/admin/clients`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="outline">
              <Archive className="mr-2 h-4 w-4" />
              Arquivar
            </Button>
          </div>
        </div>

        {/* Informações do Cliente */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </p>
                <p className="font-medium">{client.email}</p>
              </div>
              {client.phone && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              )}
              {client.city && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Cidade
                  </p>
                  <p className="font-medium">{client.city}, {client.country}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tipo</p>
                <Badge variant="outline">
                  {typeLabels[client.client_type] || client.client_type}
                </Badge>
              </div>
            </div>

            {client.tags && client.tags.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {client.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tabs de Conteúdo */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="appointments">
              Agendamentos ({stats.totalAppointments})
            </TabsTrigger>
            <TabsTrigger value="properties">
              Imóveis Interessados ({relatedProperties?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="activity">Histórico</TabsTrigger>
            <TabsTrigger value="notes">Notas</TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Agendados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Concluídos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Cancelados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                </CardContent>
              </Card>
            </div>

            {upcomingAppointments && upcomingAppointments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Próximos Agendamentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {upcomingAppointments.map((appointment: any) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityTimeline activities={activities?.slice(0, 10) || []} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Agendamentos */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Todos os Agendamentos</CardTitle>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Agendamento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Imóvel</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments?.map((appointment: any) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          {format(new Date(appointment.appointment_date), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="font-medium">{appointment.title}</TableCell>
                        <TableCell>
                          {appointment.projects ? (
                            <Link
                              to={`/project/${appointment.projects.id}`}
                              className="text-primary hover:underline"
                            >
                              {appointment.projects.title_pt}
                            </Link>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{appointment.appointment_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={appointment.status} type="appointment" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Imóveis Interessados */}
          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>Imóveis Visualizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedProperties?.map((item: any) => (
                    <PropertyInterestCard
                      key={item.projects?.id}
                      property={item.projects}
                      interactionStatus={item.appointment_type}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Histórico de Atividade */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Histórico Completo</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityTimeline activities={activities || []} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Notas */}
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Notas</CardTitle>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Nota
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {client.notes ? (
                  <div className="space-y-4">
                    {Object.entries(client.notes).map(([lang, note]) => (
                      <div key={lang} className="border-l-4 border-primary pl-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {lang.toUpperCase()}
                        </p>
                        <p className="text-sm">{note as string}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma nota registrada
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

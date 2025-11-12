import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/calendar.css';
import { Calendar as CalendarIcon, List, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ClientSelector } from '@/components/admin/ClientSelector';
import { PropertySelector } from '@/components/admin/PropertySelector';
import { DateTimePicker } from '@/components/admin/DateTimePicker';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { 'pt-BR': ptBR },
});

const appointmentSchema = z.object({
  client_id: z.string().uuid('Selecione um cliente'),
  property_id: z.string().optional(),
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(100),
  description: z.string().optional(),
  appointment_date: z.date({ required_error: 'Data obrigatória' }),
  appointment_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
  duration_minutes: z.number().min(15).max(480).default(60),
  appointment_type: z.enum(['viewing', 'meeting', 'call', 'video_call']),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function Appointments() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [calendarView, setCalendarView] = useState<View>(Views.MONTH);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      duration_minutes: 60,
      appointment_type: 'viewing',
      appointment_date: new Date(),
      appointment_time: '10:00',
    },
  });

  const selectedDate = watch('appointment_date');
  const selectedTime = watch('appointment_time');

  // Query para agendamentos
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          clients:client_id(id, full_name, email, phone),
          projects:property_id(id, title_pt, location, main_image, price)
        `)
        .order('appointment_date', { ascending: true });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Mutation para criar agendamento
  const createMutation = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      const appointmentDateTime = new Date(data.appointment_date);
      const [hours, minutes] = data.appointment_time.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

      const appointmentData = {
        client_id: data.client_id,
        property_id: data.property_id || null,
        title: data.title,
        description: data.description || null,
        appointment_date: appointmentDateTime.toISOString(),
        duration_minutes: data.duration_minutes,
        appointment_type: data.appointment_type,
        location: data.location || null,
        notes: data.notes || null,
        status: 'scheduled',
      };

      const { error } = await supabase.from('appointments').insert([appointmentData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento criado com sucesso');
      setIsDialogOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error('Erro ao criar agendamento');
      console.error(error);
    },
  });

  // Mutation para atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Status atualizado');
    },
  });

  // Formatação de eventos para o calendário
  const calendarEvents = appointments?.map((apt) => ({
    id: apt.id,
    title: `${apt.title} - ${apt.clients?.full_name}`,
    start: new Date(apt.appointment_date),
    end: new Date(new Date(apt.appointment_date).getTime() + apt.duration_minutes * 60000),
    resource: apt,
  }));

  // Estilos por status
  const eventStyleGetter = (event: any) => {
    const statusColors: Record<string, any> = {
      scheduled: { backgroundColor: '#3b82f6', color: 'white' },
      confirmed: { backgroundColor: '#22c55e', color: 'white' },
      completed: { backgroundColor: '#6b7280', color: 'white' },
      cancelled: { backgroundColor: '#ef4444', color: 'white' },
      no_show: { backgroundColor: '#f97316', color: 'white' },
    };

    return {
      style: statusColors[event.resource.status] || {},
    };
  };

  const onSubmit = (data: AppointmentFormData) => {
    createMutation.mutate(data);
  };

  const typeLabels: Record<string, string> = {
    viewing: 'Visita',
    meeting: 'Reunião',
    call: 'Chamada',
    video_call: 'Videochamada',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Agendamentos</h1>
            <p className="text-muted-foreground">Gerencie visitas e reuniões</p>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Agendamento</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cliente *</Label>
                    <ClientSelector
                      value={watch('client_id')}
                      onChange={(value) => setValue('client_id', value)}
                    />
                    {errors.client_id && (
                      <p className="text-sm text-destructive">{errors.client_id.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Imóvel</Label>
                    <PropertySelector
                      value={watch('property_id') || null}
                      onChange={(value) => setValue('property_id', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Visita ao apartamento"
                      {...register('title')}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Detalhes adicionais sobre o agendamento"
                      {...register('description')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data e Hora *</Label>
                      <DateTimePicker
                        date={selectedDate}
                        time={selectedTime}
                        onDateChange={(date) => setValue('appointment_date', date)}
                        onTimeChange={(time) => setValue('appointment_time', time)}
                      />
                      {errors.appointment_date && (
                        <p className="text-sm text-destructive">{errors.appointment_date.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duração</Label>
                      <Select
                        value={watch('duration_minutes')?.toString()}
                        onValueChange={(value) => setValue('duration_minutes', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutos</SelectItem>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="60">1 hora</SelectItem>
                          <SelectItem value="90">1h30</SelectItem>
                          <SelectItem value="120">2 horas</SelectItem>
                          <SelectItem value="180">3 horas</SelectItem>
                          <SelectItem value="240">4 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo *</Label>
                    <Select
                      value={watch('appointment_type')}
                      onValueChange={(value: any) => setValue('appointment_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewing">Visita ao Imóvel</SelectItem>
                        <SelectItem value="meeting">Reunião Presencial</SelectItem>
                        <SelectItem value="call">Chamada Telefónica</SelectItem>
                        <SelectItem value="video_call">Videochamada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      placeholder="Endereço ou local do encontro"
                      {...register('location')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas Internas</Label>
                    <Textarea
                      id="notes"
                      placeholder="Notas privadas para a equipe"
                      {...register('notes')}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Conteúdo */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Carregando...</div>
            </CardContent>
          </Card>
        ) : viewMode === 'calendar' ? (
          <Card>
            <CardContent className="pt-6">
              <Calendar
                localizer={localizer}
                events={calendarEvents || []}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={(event) => console.log('Event clicked:', event)}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                view={calendarView}
                onView={setCalendarView}
                messages={{
                  next: 'Próximo',
                  previous: 'Anterior',
                  today: 'Hoje',
                  month: 'Mês',
                  week: 'Semana',
                  day: 'Dia',
                  agenda: 'Agenda',
                  date: 'Data',
                  time: 'Hora',
                  event: 'Evento',
                  noEventsInRange: 'Sem agendamentos neste período',
                  showMore: (total) => `+ ${total} mais`,
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Imóvel</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments?.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        {format(new Date(appointment.appointment_date), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/admin/clients/${appointment.clients?.id}`}
                          className="text-primary hover:underline"
                        >
                          {appointment.clients?.full_name}
                        </Link>
                      </TableCell>
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
                        <Badge variant="outline">
                          {typeLabels[appointment.appointment_type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={appointment.status} type="appointment" />
                      </TableCell>
                      <TableCell>{appointment.duration_minutes}min</TableCell>
                      <TableCell>
                        {appointment.status === 'scheduled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: appointment.id,
                                status: 'confirmed',
                              })
                            }
                          >
                            Confirmar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: projectsCount } = useQuery({
    queryKey: ['projects-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: clientsCount } = useQuery({
    queryKey: ['clients-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      return count || 0;
    },
  });

  const { data: upcomingAppointments } = useQuery({
    queryKey: ['upcoming-appointments'],
    queryFn: async () => {
      const today = new Date().toISOString();
      const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_date', today)
        .in('status', ['scheduled', 'confirmed']);
      return count || 0;
    },
  });

  const stats = [
    {
      title: 'Total de Imóveis',
      value: projectsCount || 0,
      icon: Building2,
      color: 'text-blue-600',
    },
    {
      title: 'Clientes Ativos',
      value: clientsCount || 0,
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Agendamentos',
      value: upcomingAppointments || 0,
      icon: Calendar,
      color: 'text-orange-600',
    },
    {
      title: 'Crescimento',
      value: '-',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Bem-vindo ao painel administrativo</p>
          </div>
          <Button onClick={() => navigate('/admin/properties/new')}>
            Adicionar Novo Imóvel
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20"
              onClick={() => navigate('/admin/properties')}
            >
              <Building2 className="mr-2 h-5 w-5" />
              Ver Imóveis
            </Button>
            <Button 
              variant="outline" 
              className="h-20"
              onClick={() => navigate('/admin/clients')}
            >
              <Users className="mr-2 h-5 w-5" />
              Ver Clientes
            </Button>
            <Button variant="outline" className="h-20" disabled>
              <Calendar className="mr-2 h-5 w-5" />
              Ver Agendamentos
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

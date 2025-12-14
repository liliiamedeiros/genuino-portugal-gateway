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
      <div className="p-4 sm:p-6 lg:p-8 3xl:p-12 4xl:p-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 3xl:mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl font-bold">Dashboard</h1>
            <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground">
              Bem-vindo ao painel administrativo
            </p>
          </div>
          <Button 
            onClick={() => navigate('/admin/properties/new')}
            className="w-full sm:w-auto min-h-touch 3xl:min-h-touch-lg 3xl:text-base 4xl:text-lg"
          >
            Adicionar Novo Imóvel
          </Button>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 3xl:gap-8 mb-6 sm:mb-8 3xl:mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="3xl:p-2 4xl:p-4">
                <CardHeader className="flex flex-row items-center justify-between pb-2 3xl:pb-3">
                  <CardTitle className="text-xs sm:text-sm 3xl:text-base 4xl:text-lg font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="3xl:p-2 4xl:p-4">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl 3xl:text-2xl 4xl:text-3xl">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 3xl:gap-6">
            <Button
              variant="outline"
              className="h-16 sm:h-20 3xl:h-24 4xl:h-28 text-sm sm:text-base 3xl:text-lg 4xl:text-xl"
              onClick={() => navigate('/admin/properties')}
            >
              <Building2 className="mr-2 h-5 w-5 3xl:h-6 3xl:w-6 4xl:h-8 4xl:w-8" />
              Ver Imóveis
            </Button>
            <Button 
              variant="outline" 
              className="h-16 sm:h-20 3xl:h-24 4xl:h-28 text-sm sm:text-base 3xl:text-lg 4xl:text-xl"
              onClick={() => navigate('/admin/clients')}
            >
              <Users className="mr-2 h-5 w-5 3xl:h-6 3xl:w-6 4xl:h-8 4xl:w-8" />
              Ver Clientes
            </Button>
            <Button 
              variant="outline" 
              className="h-16 sm:h-20 3xl:h-24 4xl:h-28 text-sm sm:text-base 3xl:text-lg 4xl:text-xl sm:col-span-2 lg:col-span-1"
              onClick={() => navigate('/admin/appointments')}
            >
              <Calendar className="mr-2 h-5 w-5 3xl:h-6 3xl:w-6 4xl:h-8 4xl:w-8" />
              Ver Agendamentos
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

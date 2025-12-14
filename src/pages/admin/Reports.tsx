import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, Calendar, Home, Download } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";

export default function Reports() {
  const [period, setPeriod] = useState("30");

  // Fetch properties data
  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch clients data
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch appointments data
  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate metrics
  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.status === "active").length;
  const soldProperties = properties.filter(p => p.status === "sold").length;
  const activeClients = clients.filter(c => c.status === "active").length;
  const leadClients = clients.filter(c => c.status === "lead").length;
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === "completed").length;
  const cancelledAppointments = appointments.filter(a => a.status === "cancelled").length;
  const attendanceRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;
  
  // Calculate total portfolio value
  const totalPortfolioValue = properties.reduce((sum, p) => sum + (p.price || 0), 0);
  
  // Calculate conversion rate
  const conversionRate = leadClients > 0 ? Math.round((activeClients / leadClients) * 100) : 0;

  // Clients by status for pie chart
  const clientsByStatus = [
    { name: "Ativos", value: clients.filter(c => c.status === "active").length, color: "hsl(var(--chart-1))" },
    { name: "Inativos", value: clients.filter(c => c.status === "inactive").length, color: "hsl(var(--chart-2))" },
    { name: "Potenciais", value: clients.filter(c => c.status === "lead").length, color: "hsl(var(--chart-3))" },
  ];

  // Appointments by status for bar chart
  const appointmentsByStatus = [
    { name: "Agendados", value: appointments.filter(a => a.status === "scheduled").length },
    { name: "Concluídos", value: appointments.filter(a => a.status === "completed").length },
    { name: "Cancelados", value: appointments.filter(a => a.status === "cancelled").length },
  ];

  const stats = [
    {
      title: "Valor Total do Portfólio",
      value: `€${totalPortfolioValue.toLocaleString()}`,
      icon: Home,
      color: "text-blue-600",
      subtitle: `${activeProperties} ativos, ${soldProperties} vendidos`,
    },
    {
      title: "Clientes Ativos",
      value: activeClients,
      icon: Users,
      color: "text-green-600",
      subtitle: `${leadClients} potenciais leads`,
    },
    {
      title: "Agendamentos",
      value: totalAppointments,
      icon: Calendar,
      color: "text-purple-600",
      subtitle: `${cancelledAppointments} cancelados`,
    },
    {
      title: "Taxa de Conversão",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      subtitle: `${attendanceRate}% comparecimento`,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 p-4 sm:p-6 lg:p-8 3xl:p-12 4xl:p-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground mt-1 3xl:text-lg 4xl:text-xl">
              Análise e métricas do sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full sm:w-[180px] min-h-touch 3xl:min-h-touch-lg">
                <SelectValue placeholder="Selecionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="min-h-touch 3xl:min-h-touch-lg">
              <Download className="h-4 w-4 mr-2 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:gap-6 3xl:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="3xl:p-6 4xl:p-8">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium 3xl:text-base 4xl:text-lg">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 3xl:h-6 3xl:w-6 4xl:h-8 4xl:w-8 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold 3xl:text-3xl 4xl:text-4xl">{stat.value}</div>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1 3xl:text-sm 4xl:text-base">{stat.subtitle}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 sm:gap-6 3xl:gap-8 md:grid-cols-2">
          {/* Clients by Status */}
          <Card className="3xl:p-6 4xl:p-8">
            <CardHeader>
              <CardTitle className="3xl:text-2xl 4xl:text-3xl">Clientes por Status</CardTitle>
              <CardDescription className="3xl:text-base 4xl:text-lg">Distribuição dos clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="3xl:!h-[400px] 4xl:!h-[500px]">
                <PieChart>
                  <Pie
                    data={clientsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {clientsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Appointments by Status */}
          <Card className="3xl:p-6 4xl:p-8">
            <CardHeader>
              <CardTitle className="3xl:text-2xl 4xl:text-3xl">Agendamentos por Status</CardTitle>
              <CardDescription className="3xl:text-base 4xl:text-lg">Status dos agendamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="3xl:!h-[400px] 4xl:!h-[500px]">
                <BarChart data={appointmentsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tables */}
        <div className="grid gap-4 sm:gap-6 3xl:gap-8 md:grid-cols-2">
          <Card className="3xl:p-6 4xl:p-8">
            <CardHeader>
              <CardTitle className="3xl:text-2xl 4xl:text-3xl">Imóveis Mais Visualizados</CardTitle>
              <CardDescription className="3xl:text-base 4xl:text-lg">Top 5 imóveis por interesse</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {properties.slice(0, 5).map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{property.title_pt}</p>
                      <p className="text-sm text-muted-foreground">
                        {property.location}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {property.price ? `€${property.price.toLocaleString()}` : "N/A"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="3xl:p-6 4xl:p-8">
            <CardHeader>
              <CardTitle className="3xl:text-2xl 4xl:text-3xl">Últimas Atividades</CardTitle>
              <CardDescription className="3xl:text-base 4xl:text-lg">Atividades recentes do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.slice(0, 5).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{appointment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${
                      appointment.status === "completed" ? "text-green-600" :
                      appointment.status === "cancelled" ? "text-red-600" :
                      "text-blue-600"
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

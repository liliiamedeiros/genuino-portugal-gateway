import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

type SystemSetting = {
  id: string;
  key: string;
  value: any;
  category: string;
  description: string | null;
};

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Record<string, any>>({});

  // Fetch settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*");
      if (error) throw error;
      return data as SystemSetting[];
    },
  });

  useEffect(() => {
    if (settingsData) {
      const settingsObj: Record<string, any> = {};
      settingsData.forEach((setting) => {
        settingsObj[setting.key] = setting.value;
      });
      setSettings(settingsObj);
    }
  }, [settingsData]);

  // Update settings mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from("system_settings")
        .update({ value })
        .eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast({
        title: "Configurações atualizadas",
        description: "As configurações foram salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    },
  });

  const handleSaveGeneral = () => {
    updateSettingMutation.mutate({ key: "company_name", value: settings.company_name });
    updateSettingMutation.mutate({ key: "contact_email", value: settings.contact_email });
    updateSettingMutation.mutate({ key: "contact_phone", value: settings.contact_phone });
  };

  const handleSaveNotifications = () => {
    updateSettingMutation.mutate({ key: "notify_new_clients", value: settings.notify_new_clients });
    updateSettingMutation.mutate({ key: "notify_new_appointments", value: settings.notify_new_appointments });
    updateSettingMutation.mutate({ key: "notify_status_changes", value: settings.notify_status_changes });
  };

  const handleSaveSystem = () => {
    updateSettingMutation.mutate({ key: "timezone", value: settings.timezone });
    updateSettingMutation.mutate({ key: "default_language", value: settings.default_language });
    updateSettingMutation.mutate({ key: "currency", value: settings.currency });
    updateSettingMutation.mutate({ key: "date_format", value: settings.date_format });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as configurações do sistema
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Informações básicas da empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nome da Empresa</Label>
                  <Input
                    id="company_name"
                    value={settings.company_name || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, company_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email de Contato</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, contact_email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Telefone</Label>
                  <Input
                    id="contact_phone"
                    value={settings.contact_phone || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, contact_phone: e.target.value })
                    }
                  />
                </div>
                <Button onClick={handleSaveGeneral}>Salvar Alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>
                  Gerencie as notificações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificar Novos Clientes</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações quando um novo cliente se registrar
                    </p>
                  </div>
                  <Switch
                    checked={settings.notify_new_clients || false}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, notify_new_clients: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificar Novos Agendamentos</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações de novos agendamentos
                    </p>
                  </div>
                  <Switch
                    checked={settings.notify_new_appointments || false}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, notify_new_appointments: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificar Mudanças de Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações quando o status mudar
                    </p>
                  </div>
                  <Switch
                    checked={settings.notify_status_changes || false}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, notify_status_changes: checked })
                    }
                  />
                </div>
                <Button onClick={handleSaveNotifications}>Salvar Alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Sistema</CardTitle>
                <CardDescription>
                  Configure preferências do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select
                    value={settings.timezone || ""}
                    onValueChange={(value) =>
                      setSettings({ ...settings, timezone: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar fuso horário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Lisbon">Europa/Lisboa</SelectItem>
                      <SelectItem value="Europe/London">Europa/Londres</SelectItem>
                      <SelectItem value="America/New_York">América/Nova York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma Padrão</Label>
                  <Select
                    value={settings.default_language || ""}
                    onValueChange={(value) =>
                      setSettings({ ...settings, default_language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Moeda</Label>
                  <Select
                    value={settings.currency || ""}
                    onValueChange={(value) =>
                      setSettings({ ...settings, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar moeda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveSystem}>Salvar Alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
                <CardDescription>
                  Gerencie a segurança da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Alterar Senha</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Use uma senha forte com pelo menos 8 caracteres
                  </p>
                  <Button variant="outline">Alterar Senha</Button>
                </div>
                <div className="space-y-2">
                  <Label>Logs de Acesso</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Visualize o histórico de acessos à sua conta
                  </p>
                  <Button variant="outline">Ver Logs</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

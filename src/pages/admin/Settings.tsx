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
import { useState, useEffect, useRef } from "react";
import { Image, Upload, Loader2, Globe, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  
  // Favicon state
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [faviconDimensions, setFaviconDimensions] = useState<{width: number, height: number} | null>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

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
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 3xl:p-12 4xl:p-16">
        <div>
          <h1 className="text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1 3xl:text-lg 4xl:text-xl">
            Gerencie as configurações do sistema
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="general" className="min-h-touch text-xs sm:text-sm 3xl:text-base">Geral</TabsTrigger>
            <TabsTrigger value="email" className="min-h-touch text-xs sm:text-sm 3xl:text-base">Email</TabsTrigger>
            <TabsTrigger value="notifications" className="min-h-touch text-xs sm:text-sm 3xl:text-base">Notificações</TabsTrigger>
            <TabsTrigger value="system" className="min-h-touch text-xs sm:text-sm 3xl:text-base">Sistema</TabsTrigger>
            <TabsTrigger value="security" className="min-h-touch text-xs sm:text-sm 3xl:text-base">Segurança</TabsTrigger>
            <TabsTrigger value="integrations" className="min-h-touch text-xs sm:text-sm 3xl:text-base">Integrações</TabsTrigger>
            <TabsTrigger value="favicon" className="min-h-touch text-xs sm:text-sm 3xl:text-base">
              <Globe className="w-4 h-4 mr-1" />
              Favicon
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader className="3xl:p-8">
                <CardTitle className="3xl:text-2xl 4xl:text-3xl">Configurações Gerais</CardTitle>
                <CardDescription className="3xl:text-base 4xl:text-lg">
                  Informações básicas da empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 3xl:space-y-6 3xl:p-8">
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
                <div className="space-y-2">
                  <Label htmlFor="company_logo_url">URL do Logo</Label>
                  <Input
                    id="company_logo_url"
                    value={settings.company_logo_url || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, company_logo_url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_slogan">Slogan da Empresa</Label>
                  <Input
                    id="company_slogan"
                    value={settings.company_slogan || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, company_slogan: e.target.value })
                    }
                  />
                </div>
                <Button onClick={handleSaveGeneral} className="min-h-touch 3xl:min-h-touch-lg">Salvar Alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email">
            <Card>
              <CardHeader className="3xl:p-8">
                <CardTitle className="3xl:text-2xl 4xl:text-3xl">Configurações de Email</CardTitle>
                <CardDescription className="3xl:text-base 4xl:text-lg">
                  Configure o servidor SMTP para envio de emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 3xl:space-y-6 3xl:p-8">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">Servidor SMTP</Label>
                  <Input
                    id="smtp_host"
                    value={settings.smtp_host || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, smtp_host: e.target.value })
                    }
                    placeholder="smtp.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_port">Porta SMTP</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={settings.smtp_port || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, smtp_port: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_user">Usuário SMTP</Label>
                  <Input
                    id="smtp_user"
                    value={settings.smtp_user || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, smtp_user: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_password">Senha SMTP</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={settings.smtp_password || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, smtp_password: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_from">Email Remetente</Label>
                  <Input
                    id="email_from"
                    type="email"
                    value={settings.email_from || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, email_from: e.target.value })
                    }
                    placeholder="noreply@example.com"
                  />
                </div>
                <Button className="min-h-touch 3xl:min-h-touch-lg" onClick={() => {
                  updateSettingMutation.mutate({ key: "smtp_host", value: settings.smtp_host });
                  updateSettingMutation.mutate({ key: "smtp_port", value: settings.smtp_port });
                  updateSettingMutation.mutate({ key: "smtp_user", value: settings.smtp_user });
                  updateSettingMutation.mutate({ key: "smtp_password", value: settings.smtp_password });
                  updateSettingMutation.mutate({ key: "email_from", value: settings.email_from });
                }}>
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader className="3xl:p-8">
                <CardTitle className="3xl:text-2xl 4xl:text-3xl">Configurações de Notificações</CardTitle>
                <CardDescription className="3xl:text-base 4xl:text-lg">
                  Gerencie as notificações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 3xl:space-y-8 3xl:p-8">
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
                <Button onClick={handleSaveNotifications} className="min-h-touch 3xl:min-h-touch-lg">Salvar Alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system">
            <Card>
              <CardHeader className="3xl:p-8">
                <CardTitle className="3xl:text-2xl 4xl:text-3xl">Configurações de Sistema</CardTitle>
                <CardDescription className="3xl:text-base 4xl:text-lg">
                  Configure preferências do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 3xl:space-y-6 3xl:p-8">
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
                <Button onClick={handleSaveSystem} className="min-h-touch 3xl:min-h-touch-lg">Salvar Alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader className="3xl:p-8">
                <CardTitle className="3xl:text-2xl 4xl:text-3xl">Configurações de Segurança</CardTitle>
                <CardDescription className="3xl:text-base 4xl:text-lg">
                  Gerencie a segurança e políticas de senha
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 3xl:space-y-8 3xl:p-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-muted-foreground">
                      Adicione uma camada extra de segurança
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_2fa || false}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, enable_2fa: checked })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_password_length">Comprimento Mínimo da Senha</Label>
                  <Input
                    id="min_password_length"
                    type="number"
                    value={settings.min_password_length || 8}
                    onChange={(e) =>
                      setSettings({ ...settings, min_password_length: parseInt(e.target.value) })
                    }
                    min="6"
                    max="20"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Exigir Caracteres Especiais</Label>
                    <p className="text-sm text-muted-foreground">
                      Senhas devem conter caracteres especiais
                    </p>
                  </div>
                  <Switch
                    checked={settings.require_special_chars || false}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, require_special_chars: checked })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Timeout da Sessão (minutos)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    value={settings.session_timeout || 30}
                    onChange={(e) =>
                      setSettings({ ...settings, session_timeout: parseInt(e.target.value) })
                    }
                    min="5"
                    max="120"
                  />
                </div>
                <Button onClick={() => {
                  updateSettingMutation.mutate({ key: "enable_2fa", value: settings.enable_2fa });
                  updateSettingMutation.mutate({ key: "min_password_length", value: settings.min_password_length });
                  updateSettingMutation.mutate({ key: "require_special_chars", value: settings.require_special_chars });
                  updateSettingMutation.mutate({ key: "session_timeout", value: settings.session_timeout });
                }}>
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Settings */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integrações</CardTitle>
                <CardDescription>
                  Configure integrações com serviços externos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                  <Input
                    id="google_analytics_id"
                    value={settings.google_analytics_id || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, google_analytics_id: e.target.value })
                    }
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
                  <Input
                    id="facebook_pixel_id"
                    value={settings.facebook_pixel_id || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, facebook_pixel_id: e.target.value })
                    }
                    placeholder="123456789012345"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook_url">Webhook URL</Label>
                  <Input
                    id="webhook_url"
                    value={settings.webhook_url || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, webhook_url: e.target.value })
                    }
                    placeholder="https://example.com/webhook"
                  />
                  <p className="text-sm text-muted-foreground">
                    URL para receber notificações de eventos do sistema
                  </p>
                </div>
                <Button onClick={() => {
                  updateSettingMutation.mutate({ key: "google_analytics_id", value: settings.google_analytics_id });
                  updateSettingMutation.mutate({ key: "facebook_pixel_id", value: settings.facebook_pixel_id });
                  updateSettingMutation.mutate({ key: "webhook_url", value: settings.webhook_url });
                }}>
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favicon Settings */}
          <TabsContent value="favicon">
            <Card>
              <CardHeader className="3xl:p-8">
                <CardTitle className="3xl:text-2xl 4xl:text-3xl flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Favicon
                </CardTitle>
                <CardDescription className="3xl:text-base 4xl:text-lg">
                  Ícone que aparece no separador do browser. Recomendado: PNG, ICO ou SVG, 32x32px ou 64x64px.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 3xl:space-y-8 3xl:p-8">
                {/* Preview atual */}
                <div className="space-y-2">
                  <Label>Favicon Atual</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50 overflow-hidden">
                      {settings.favicon_url ? (
                        <img 
                          src={settings.favicon_url} 
                          alt="Favicon atual" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Image className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    {settings.favicon_url && (
                      <div className="text-sm text-muted-foreground">
                        <p>URL atual:</p>
                        <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                          {settings.favicon_url}
                        </code>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload zona */}
                <div className="space-y-2">
                  <Label>Carregar Novo Favicon</Label>
                  <div 
                    className="relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 hover:border-primary/50 hover:bg-accent/50 cursor-pointer"
                    onClick={() => faviconInputRef.current?.click()}
                  >
                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept=".png,.ico,.svg,image/png,image/x-icon,image/svg+xml"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFaviconFile(file);
                          setFaviconDimensions(null);
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const dataUrl = event.target?.result as string;
                            setFaviconPreview(dataUrl);
                            
                            // Validate image dimensions
                            const img = new window.Image();
                            img.onload = () => {
                              const { naturalWidth, naturalHeight } = img;
                              setFaviconDimensions({ width: naturalWidth, height: naturalHeight });
                              
                              const validSizes = [16, 32, 48, 64, 128, 256];
                              const isSquare = naturalWidth === naturalHeight;
                              const isValidSize = validSizes.includes(naturalWidth);
                              
                              if (!isSquare) {
                                toast({
                                  title: "Aviso: Imagem não quadrada",
                                  description: `Detectado: ${naturalWidth}x${naturalHeight}px. Favicons devem ser quadrados para melhor compatibilidade.`,
                                  variant: "destructive",
                                });
                              } else if (!isValidSize) {
                                toast({
                                  title: "Aviso: Tamanho não recomendado",
                                  description: `Detectado: ${naturalWidth}x${naturalHeight}px. Tamanhos recomendados: 32x32 ou 64x64.`,
                                });
                              }
                            };
                            img.src = dataUrl;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground text-center">
                        Clique para selecionar ou arraste um ficheiro
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, ICO ou SVG • Recomendado: 32x32px ou 64x64px
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preview do novo favicon */}
                {faviconPreview && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Preview do Novo Favicon</Label>
                      {faviconDimensions && (
                        <>
                          <Badge 
                            variant={faviconDimensions.width === faviconDimensions.height ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {faviconDimensions.width}x{faviconDimensions.height}px
                          </Badge>
                          {faviconDimensions.width === faviconDimensions.height && 
                           [16, 32, 48, 64, 128, 256].includes(faviconDimensions.width) ? (
                            <CheckCircle className="w-4 h-4 text-primary" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg border-2 border-primary flex items-center justify-center bg-background overflow-hidden">
                        <img 
                          src={faviconPreview} 
                          alt="Preview favicon" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border flex items-center justify-center bg-background overflow-hidden">
                          <img 
                            src={faviconPreview} 
                            alt="Preview 32px" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">32x32</span>
                        <div className="w-4 h-4 rounded border flex items-center justify-center bg-background overflow-hidden">
                          <img 
                            src={faviconPreview} 
                            alt="Preview 16px" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">16x16</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFaviconFile(null);
                          setFaviconPreview(null);
                          setFaviconDimensions(null);
                          if (faviconInputRef.current) {
                            faviconInputRef.current.value = '';
                          }
                        }}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                )}

                {/* Botão salvar */}
                <Button 
                  className="min-h-touch 3xl:min-h-touch-lg"
                  disabled={!faviconFile || isUploadingFavicon}
                  onClick={async () => {
                    if (!faviconFile) return;
                    
                    setIsUploadingFavicon(true);
                    try {
                      // Generate unique filename
                      const extension = faviconFile.name.split('.').pop();
                      const fileName = `favicon/favicon-${Date.now()}.${extension}`;
                      
                      // Upload to Supabase Storage
                      const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('project-images')
                        .upload(fileName, faviconFile, {
                          cacheControl: '3600',
                          upsert: true
                        });
                      
                      if (uploadError) throw uploadError;
                      
                      // Get public URL
                      const { data: { publicUrl } } = supabase.storage
                        .from('project-images')
                        .getPublicUrl(fileName);
                      
                      // Save URL to system_settings
                      const { error: upsertError } = await supabase
                        .from('system_settings')
                        .upsert({
                          key: 'favicon_url',
                          value: publicUrl,
                          category: 'branding',
                          description: 'URL do favicon do site'
                        }, {
                          onConflict: 'key'
                        });
                      
                      if (upsertError) throw upsertError;
                      
                      // Update local state
                      setSettings({ ...settings, favicon_url: publicUrl });
                      setFaviconFile(null);
                      setFaviconPreview(null);
                      if (faviconInputRef.current) {
                        faviconInputRef.current.value = '';
                      }
                      
                      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
                      
                      toast({
                        title: "Favicon atualizado",
                        description: "O favicon foi guardado com sucesso. Para aplicar no site, atualize o index.html com o URL acima.",
                      });
                    } catch (error) {
                      console.error('Erro ao fazer upload do favicon:', error);
                      toast({
                        title: "Erro ao guardar",
                        description: "Não foi possível guardar o favicon. Tente novamente.",
                        variant: "destructive",
                      });
                    } finally {
                      setIsUploadingFavicon(false);
                    }
                  }}
                >
                  {isUploadingFavicon ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      A carregar...
                    </>
                  ) : (
                    'Salvar Favicon'
                  )}
                </Button>

                {/* Instruções */}
                <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground space-y-2">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Aplicação automática
                  </p>
                  <p>
                    O favicon será aplicado automaticamente em todas as páginas após guardar.
                    O sistema usa injeção dinâmica via React Helmet, sobrepondo o favicon estático inicial.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

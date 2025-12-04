import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Edit, 
  Eye, 
  EyeOff,
  Building2,
  TrendingUp,
  CheckCircle,
  Clock,
  Settings,
  Save,
  RefreshCw
} from 'lucide-react';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

interface PortfolioSettings {
  projects_per_page: number;
  default_sort: SortOption;
  show_filters: boolean;
  show_search: boolean;
  show_advanced_filters: boolean;
}

export default function PortfolioManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Settings state
  const [localSettings, setLocalSettings] = useState<PortfolioSettings>({
    projects_per_page: 12,
    default_sort: 'date-desc',
    show_filters: true,
    show_search: true,
    show_advanced_filters: true,
  });

  // Fetch portfolio settings
  const { data: savedSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['admin-portfolio-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value, id')
        .eq('category', 'portfolio');
      
      if (error) throw error;
      
      const settings: PortfolioSettings = {
        projects_per_page: 12,
        default_sort: 'date-desc',
        show_filters: true,
        show_search: true,
        show_advanced_filters: true,
      };
      
      if (data) {
        data.forEach((setting) => {
          const value = (setting.value as { value: any })?.value;
          if (setting.key === 'projects_per_page' && typeof value === 'number') {
            settings.projects_per_page = value;
          }
          if (setting.key === 'default_sort' && typeof value === 'string') {
            settings.default_sort = value as SortOption;
          }
          if (setting.key === 'show_filters' && typeof value === 'boolean') {
            settings.show_filters = value;
          }
          if (setting.key === 'show_search' && typeof value === 'boolean') {
            settings.show_search = value;
          }
          if (setting.key === 'show_advanced_filters' && typeof value === 'boolean') {
            settings.show_advanced_filters = value;
          }
        });
      }
      
      setLocalSettings(settings);
      return { settings, rawData: data };
    }
  });

  // Fetch all projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ['admin-portfolio'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: PortfolioSettings) => {
      const updates = [
        { key: 'projects_per_page', value: { value: settings.projects_per_page } },
        { key: 'default_sort', value: { value: settings.default_sort } },
        { key: 'show_filters', value: { value: settings.show_filters } },
        { key: 'show_search', value: { value: settings.show_search } },
        { key: 'show_advanced_filters', value: { value: settings.show_advanced_filters } },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: update.value })
          .eq('key', update.key)
          .eq('category', 'portfolio');
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-settings'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-settings'] });
      toast.success('Configurações guardadas! As alterações já estão visíveis no site público.');
    },
    onError: () => {
      toast.error('Erro ao guardar configurações');
    },
  });

  // Toggle project status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-projects'] });
      toast.success('Estado atualizado! Alteração visível no site público.');
    },
    onError: () => {
      toast.error('Erro ao atualizar estado');
    },
  });

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase
        .from('projects')
        .update({ featured })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-projects'] });
      toast.success('Destaque atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar destaque');
    },
  });

  // Filter projects
  const filteredProjects = projects?.filter(project => 
    project.title_pt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const stats = {
    total: projects?.length || 0,
    active: projects?.filter(p => p.status === 'active').length || 0,
    draft: projects?.filter(p => p.status === 'draft').length || 0,
    featured: projects?.filter(p => p.featured).length || 0,
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Ativo</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'sold':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Vendido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const hasSettingsChanged = savedSettings && (
    localSettings.projects_per_page !== savedSettings.settings.projects_per_page ||
    localSettings.default_sort !== savedSettings.settings.default_sort ||
    localSettings.show_filters !== savedSettings.settings.show_filters ||
    localSettings.show_search !== savedSettings.settings.show_search ||
    localSettings.show_advanced_filters !== savedSettings.settings.show_advanced_filters
  );

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Gestão do Portfolio</h1>
            <p className="text-muted-foreground mt-1">
              Gerir projetos e configurações do portfolio público
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <a href="/portfolio" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Portfolio Público
              </a>
            </Button>
            <Button asChild>
              <Link to="/admin/properties/new">
                <Plus className="h-4 w-4 mr-2" />
                Novo Imóvel
              </Link>
            </Button>
          </div>
        </div>

        {/* Settings Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações de Exibição
            </CardTitle>
            <CardDescription>
              Estas configurações afetam diretamente como o portfolio é exibido no site público
            </CardDescription>
          </CardHeader>
          <CardContent>
            {settingsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                A carregar configurações...
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="projects_per_page">Projetos por página</Label>
                    <Select 
                      value={String(localSettings.projects_per_page)} 
                      onValueChange={(v) => setLocalSettings(prev => ({ ...prev, projects_per_page: Number(v) }))}
                    >
                      <SelectTrigger id="projects_per_page">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 projetos</SelectItem>
                        <SelectItem value="9">9 projetos</SelectItem>
                        <SelectItem value="12">12 projetos</SelectItem>
                        <SelectItem value="15">15 projetos</SelectItem>
                        <SelectItem value="18">18 projetos</SelectItem>
                        <SelectItem value="24">24 projetos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default_sort">Ordenação padrão</Label>
                    <Select 
                      value={localSettings.default_sort} 
                      onValueChange={(v) => setLocalSettings(prev => ({ ...prev, default_sort: v as SortOption }))}
                    >
                      <SelectTrigger id="default_sort">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-desc">Mais recentes</SelectItem>
                        <SelectItem value="date-asc">Mais antigos</SelectItem>
                        <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
                        <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
                        <SelectItem value="price-asc">Preço (menor)</SelectItem>
                        <SelectItem value="price-desc">Preço (maior)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Visibilidade de elementos</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <Label htmlFor="show_search" className="cursor-pointer">Mostrar pesquisa</Label>
                      <Switch
                        id="show_search"
                        checked={localSettings.show_search}
                        onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, show_search: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <Label htmlFor="show_filters" className="cursor-pointer">Mostrar filtros</Label>
                      <Switch
                        id="show_filters"
                        checked={localSettings.show_filters}
                        onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, show_filters: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <Label htmlFor="show_advanced_filters" className="cursor-pointer">Filtros avançados</Label>
                      <Switch
                        id="show_advanced_filters"
                        checked={localSettings.show_advanced_filters}
                        onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, show_advanced_filters: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => saveSettingsMutation.mutate(localSettings)}
                    disabled={!hasSettingsChanged || saveSettingsMutation.isPending}
                  >
                    {saveSettingsMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Guardar Configurações
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-xs text-muted-foreground mt-1">Visíveis no site</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rascunhos</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.draft}</p>
              <p className="text-xs text-muted-foreground mt-1">Não visíveis</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Destaques</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{stats.featured}</p>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm text-primary">
            <strong>Sincronização automática:</strong> Todas as alterações feitas aqui (ativar/desativar projetos, alterar destaques, configurações) são refletidas <strong>imediatamente</strong> no Portfolio do site público.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por título, localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle>Projetos no Portfolio</CardTitle>
            <CardDescription>
              Ative ou desative projetos para controlar o que aparece no site público
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                A carregar projetos...
              </div>
            ) : filteredProjects && filteredProjects.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Foto</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-center">Destaque</TableHead>
                      <TableHead className="text-center">Visível no Site</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          {project.main_image ? (
                            <img 
                              src={project.main_image} 
                              alt={project.title_pt}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {project.title_pt}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {project.location}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {project.property_type || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(project.status)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={project.featured || false}
                            onCheckedChange={(checked) => 
                              toggleFeaturedMutation.mutate({ id: project.id, featured: checked })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleStatusMutation.mutate({
                              id: project.id,
                              newStatus: project.status === 'active' ? 'draft' : 'active'
                            })}
                            title={project.status === 'active' ? 'Clique para ocultar do site' : 'Clique para mostrar no site'}
                          >
                            {project.status === 'active' ? (
                              <Eye className="h-4 w-4 text-green-500" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button asChild variant="ghost" size="icon" title="Ver no site">
                              <a 
                                href={`/project/${project.id}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button asChild variant="ghost" size="icon" title="Editar">
                              <Link to={`/admin/properties/edit/${project.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Nenhum projeto encontrado</p>
                <p className="text-sm">
                  {projects?.length === 0 
                    ? 'Adicione projetos para que apareçam no portfolio público.'
                    : 'Tente ajustar os termos de pesquisa.'}
                </p>
                {projects?.length === 0 && (
                  <Button asChild className="mt-4">
                    <Link to="/admin/properties/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Projeto
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

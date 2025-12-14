import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Eye, EyeOff, Pencil, Trash2, Save, ExternalLink, Star, Loader2, AlertTriangle, Upload, Play, Pause } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { projects as staticProjects } from '@/data/projects';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

interface PortfolioSettings {
  projects_per_page: number;
  default_sort: SortOption;
}

interface MigrationLog {
  id: string;
  title: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  message?: string;
}

export default function PortfolioList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);
  const [isMigratingFromProjects, setIsMigratingFromProjects] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationLogs, setMigrationLogs] = useState<MigrationLog[]>([]);
  const [settings, setSettings] = useState<PortfolioSettings>({
    projects_per_page: 12,
    default_sort: 'date-desc',
  });

  // Fetch portfolio settings
  const { data: savedSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['portfolio-settings-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .eq('category', 'portfolio');
      
      if (error) throw error;
      
      const loadedSettings: PortfolioSettings = { ...settings };
      
      if (data) {
        data.forEach((setting) => {
          const value = (setting.value as { value: any })?.value;
          if (setting.key === 'projects_per_page') {
            const numValue = typeof value === 'number' ? value : parseInt(value, 10);
            if (!isNaN(numValue)) loadedSettings.projects_per_page = numValue;
          }
          if (setting.key === 'default_sort' && typeof value === 'string') {
            loadedSettings.default_sort = value as SortOption;
          }
        });
        setSettings(loadedSettings);
      }
      
      return loadedSettings;
    }
  });

  // Fetch portfolio projects from the NEW portfolio_projects table
  const { data: portfolioProjects, isLoading: projectsLoading, refetch: refetchProjects } = useQuery({
    queryKey: ['admin-portfolio-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch projects from the projects table (Imóveis) to migrate
  const { data: projectsToMigrate } = useQuery({
    queryKey: ['projects-for-migration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate unmigrated projects from static data - check by title since IDs are different types
  const unmigratedProjects = staticProjects.filter(
    staticProject => !portfolioProjects?.some(dbProject => dbProject.title_pt === staticProject.title.pt)
  );

  // Calculate projects from 'projects' table not yet in portfolio_projects - check by title
  const unmigratedFromProjectsTable = projectsToMigrate?.filter(
    proj => !portfolioProjects?.some(pp => pp.title_pt === proj.title_pt)
  ) || [];

  // Upload image to storage
  const uploadImageToStorage = async (imageUrl: string, projectId: string, index: number): Promise<string> => {
    try {
      if (imageUrl.includes('supabase.co')) return imageUrl;
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const fileExt = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `portfolio/${projectId}/${Date.now()}_${index}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('project-images')
        .upload(fileName, blob, { contentType: blob.type, upsert: true });
      
      if (error) throw error;
      
      const { data: publicUrl } = supabase.storage
        .from('project-images')
        .getPublicUrl(data.path);
      
      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return imageUrl;
    }
  };

  // Migrate a single project
  const migrateProject = async (project: typeof staticProjects[0]) => {
    setMigrationLogs(prev => prev.map(log => 
      log.id === project.id ? { ...log, status: 'uploading' as const, message: 'Fazendo upload das imagens...' } : log
    ));

    try {
      // First check if already exists by title
      const { data: existing } = await supabase
        .from('portfolio_projects')
        .select('id')
        .eq('title_pt', project.title.pt)
        .maybeSingle();

      if (existing) {
        setMigrationLogs(prev => prev.map(log => 
          log.id === project.id ? { ...log, status: 'success' as const, message: 'Já existe na base de dados' } : log
        ));
        return;
      }

      // Generate a temp ID for uploads before we have the real UUID
      const tempId = `temp_${Date.now()}`;
      const mainImageUrl = project.mainImage ? await uploadImageToStorage(project.mainImage, tempId, 0) : null;
      
      // Insert WITHOUT id - let Supabase generate UUID automatically
      const { data: insertedProject, error: projectError } = await supabase.from('portfolio_projects').insert([{
        // id NOT included - Supabase will auto-generate UUID
        title_pt: project.title.pt,
        title_fr: project.title.fr,
        title_en: project.title.en,
        title_de: project.title.de,
        description_pt: project.description.pt,
        description_fr: project.description.fr,
        description_en: project.description.en,
        description_de: project.description.de,
        location: project.location,
        region: project.region,
        main_image: mainImageUrl,
        status: 'active',
        featured: false,
      }]).select('id').single();

      if (projectError) throw projectError;

      const newProjectId = insertedProject.id;

      // Upload gallery images using the new UUID
      for (let i = 1; i < project.gallery.length; i++) {
        const imageUrl = await uploadImageToStorage(project.gallery[i], newProjectId, i);
        await supabase.from('portfolio_images').insert([{
          portfolio_id: newProjectId,
          image_url: imageUrl,
          order_index: i,
        }]);
      }

      setMigrationLogs(prev => prev.map(log => 
        log.id === project.id ? { ...log, status: 'success' as const, message: 'Migrado com sucesso!' } : log
      ));
    } catch (error: any) {
      console.error('Error migrating project:', project.id, error);
      setMigrationLogs(prev => prev.map(log => 
        log.id === project.id ? { ...log, status: 'error' as const, message: error.message } : log
      ));
    }
  };

  // Start migration
  const startMigration = async () => {
    if (unmigratedProjects.length === 0) return;

    setIsMigrating(true);
    setMigrationProgress(0);
    setMigrationLogs(unmigratedProjects.map(p => ({
      id: p.id,
      title: p.title.pt,
      status: 'pending' as const
    })));

    for (let i = 0; i < unmigratedProjects.length; i++) {
      await migrateProject(unmigratedProjects[i]);
      setMigrationProgress(((i + 1) / unmigratedProjects.length) * 100);
    }

    setIsMigrating(false);
    toast({
      title: 'Migração concluída!',
      description: `${unmigratedProjects.length} projetos foram migrados para a base de dados.`,
    });
    
    queryClient.invalidateQueries({ queryKey: ['admin-portfolio-projects'] });
    queryClient.invalidateQueries({ queryKey: ['portfolio-projects'] });
  };

  // Migrate projects from 'projects' table to 'portfolio_projects'
  const migrateFromProjectsTable = async () => {
    if (unmigratedFromProjectsTable.length === 0) return;

    setIsMigratingFromProjects(true);
    setMigrationProgress(0);
    setMigrationLogs(unmigratedFromProjectsTable.map(p => ({
      id: p.id,
      title: p.title_pt,
      status: 'pending' as const
    })));

    for (let i = 0; i < unmigratedFromProjectsTable.length; i++) {
      const proj = unmigratedFromProjectsTable[i];
      setMigrationLogs(prev => prev.map(log => 
        log.id === proj.id ? { ...log, status: 'uploading' as const, message: 'Migrando...' } : log
      ));

      try {
        // Check if already exists by title
        const { data: existing } = await supabase
          .from('portfolio_projects')
          .select('id')
          .eq('title_pt', proj.title_pt)
          .maybeSingle();

        if (existing) {
          setMigrationLogs(prev => prev.map(log => 
            log.id === proj.id ? { ...log, status: 'success' as const, message: 'Já existe no Portfolio' } : log
          ));
          setMigrationProgress(((i + 1) / unmigratedFromProjectsTable.length) * 100);
          continue;
        }

        // Insert into portfolio_projects WITHOUT id - let Supabase generate UUID
        const { data: insertedProject, error: projectError } = await supabase.from('portfolio_projects').insert([{
          // id NOT included - Supabase auto-generates UUID (projects.id is TEXT, portfolio_projects.id is UUID)
          title_pt: proj.title_pt,
          title_fr: proj.title_fr || proj.title_pt,
          title_en: proj.title_en || proj.title_pt,
          title_de: proj.title_de || proj.title_pt,
          description_pt: proj.description_pt,
          description_fr: proj.description_fr || proj.description_pt,
          description_en: proj.description_en || proj.description_pt,
          description_de: proj.description_de || proj.description_pt,
          location: proj.location,
          region: proj.region,
          city: proj.city,
          address: proj.address,
          postal_code: proj.postal_code,
          property_type: proj.property_type,
          operation_type: proj.operation_type,
          price: proj.price,
          bedrooms: proj.bedrooms,
          bathrooms: proj.bathrooms,
          area_sqm: proj.area_sqm,
          parking_spaces: proj.parking_spaces,
          main_image: proj.main_image,
          features: proj.features,
          tags: proj.tags,
          video_url: proj.video_url,
          virtual_tour_url: proj.virtual_tour_url,
          map_embed_url: proj.map_embed_url,
          map_latitude: proj.map_latitude,
          map_longitude: proj.map_longitude,
          json_ld: proj.json_ld,
          status: proj.status || 'active',
          featured: proj.featured || false,
        }]).select('id').single();

        if (projectError) throw projectError;

        const newPortfolioId = insertedProject.id;

        // Migrate images from project_images to portfolio_images using new UUID
        const { data: existingImages } = await supabase
          .from('project_images')
          .select('*')
          .eq('project_id', proj.id)
          .order('order_index');

        if (existingImages && existingImages.length > 0) {
          for (const img of existingImages) {
            await supabase.from('portfolio_images').insert([{
              portfolio_id: newPortfolioId,
              image_url: img.image_url,
              order_index: img.order_index,
            }]);
          }
        }

        setMigrationLogs(prev => prev.map(log => 
          log.id === proj.id ? { ...log, status: 'success' as const, message: 'Migrado com sucesso!' } : log
        ));
      } catch (error: any) {
        console.error('Error migrating project:', proj.id, error);
        setMigrationLogs(prev => prev.map(log => 
          log.id === proj.id ? { ...log, status: 'error' as const, message: error.message } : log
        ));
      }

      setMigrationProgress(((i + 1) / unmigratedFromProjectsTable.length) * 100);
    }

    setIsMigratingFromProjects(false);
    toast({
      title: 'Migração de Imóveis concluída!',
      description: `${unmigratedFromProjectsTable.length} projetos foram migrados para o Portfolio.`,
    });
    
    queryClient.invalidateQueries({ queryKey: ['admin-portfolio-projects'] });
    queryClient.invalidateQueries({ queryKey: ['portfolio-projects'] });
    queryClient.invalidateQueries({ queryKey: ['projects-for-migration'] });
  };

  // Save settings mutation - FIXED: check if exists then update or insert
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: PortfolioSettings) => {
      const settingsToSave = [
        { key: 'projects_per_page', value: { value: newSettings.projects_per_page }, category: 'portfolio' },
        { key: 'default_sort', value: { value: newSettings.default_sort }, category: 'portfolio' },
      ];

      for (const setting of settingsToSave) {
        // First check if setting exists
        const { data: existing } = await supabase
          .from('site_settings')
          .select('id')
          .eq('key', setting.key)
          .eq('category', 'portfolio')
          .maybeSingle();

        if (existing) {
          // Update existing setting
          const { error } = await supabase
            .from('site_settings')
            .update({ value: setting.value, updated_at: new Date().toISOString() })
            .eq('key', setting.key)
            .eq('category', 'portfolio');
          if (error) throw error;
        } else {
          // Insert new setting
          const { error } = await supabase
            .from('site_settings')
            .insert([setting]);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      toast({ title: 'Configurações guardadas com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['portfolio-settings'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-settings-admin'] });
    },
    onError: (error: any) => {
      console.error('Settings save error:', error);
      toast({ title: 'Erro ao guardar configurações', description: error.message, variant: 'destructive' });
    }
  });

  // Toggle status mutation with improved error handling
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      console.log('Tentando alterar status do portfolio:', { id, newStatus });
      
      const { data, error } = await supabase
        .from('portfolio_projects')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao alterar status do portfolio:', error);
        throw error;
      }
      
      console.log('Status alterado com sucesso:', data);
      return newStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-projects'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-projects'] });
      toast({ 
        title: newStatus === 'active' ? 'Projeto ativado!' : 'Projeto pausado!',
        description: newStatus === 'active' 
          ? 'O projeto agora está visível no site público.' 
          : 'O projeto foi ocultado do site público.'
      });
    },
    onError: (error: any) => {
      console.error('Erro na mutation toggleStatus:', error);
      toast({ 
        title: 'Erro ao alterar estado', 
        description: error.message || 'Erro desconhecido. Verifique a consola para mais detalhes.', 
        variant: 'destructive' 
      });
    }
  });

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase
        .from('portfolio_projects')
        .update({ featured })
        .eq('id', id);
      if (error) throw error;
      return featured;
    },
    onSuccess: (featured) => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-projects'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-projects'] });
      toast({ 
        title: featured ? 'Projeto em destaque!' : 'Destaque removido!',
        description: featured 
          ? 'Este projeto aparecerá na seção de destaques.' 
          : 'O projeto foi removido da seção de destaques.'
      });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar destaque', description: error.message, variant: 'destructive' });
    }
  });

  // Delete mutation with proper cleanup
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // First delete associated images from portfolio_images
      const { error: imagesError } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('portfolio_id', id);
      
      if (imagesError) {
        console.error('Error deleting portfolio images:', imagesError);
      }

      // Then delete the project
      const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-projects'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-projects'] });
      toast({ 
        title: 'Projeto eliminado com sucesso!', 
        description: 'O projeto e todas as suas imagens foram removidos.' 
      });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao eliminar', description: error.message, variant: 'destructive' });
    }
  });

  const filteredProjects = portfolioProjects?.filter(p =>
    p.title_pt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const isLoading = settingsLoading || projectsLoading;

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 3xl:p-12 4xl:p-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl font-bold">Gestão do Portfolio</h1>
            <p className="text-muted-foreground 3xl:text-lg 4xl:text-xl">
              Gerir projetos do Portfolio (tabela separada de Imóveis)
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="min-h-touch 3xl:min-h-touch-lg" asChild>
              <Link to="/portfolio" target="_blank">
                <ExternalLink className="mr-2 h-4 w-4 3xl:h-5 3xl:w-5" />
                Ver Portfolio
              </Link>
            </Button>
            <Button className="min-h-touch 3xl:min-h-touch-lg" onClick={() => navigate('/admin/portfolio/new')}>
              <Plus className="mr-2 h-4 w-4 3xl:h-5 3xl:w-5" />
              Novo Projeto
            </Button>
          </div>
        </div>

        {/* Migration Alert */}
        {unmigratedProjects.length > 0 && (
          <Alert className="border-amber-500 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-600">Migração Pendente</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>
                Foram encontrados <strong>{unmigratedProjects.length}</strong> projetos estáticos que precisam ser migrados 
                para a tabela <code className="bg-muted px-1 rounded">portfolio_projects</code>.
              </p>
              
              {isMigrating ? (
                <div className="space-y-2">
                  <Progress value={migrationProgress} className="h-2" />
                  <div className="text-sm">
                    {migrationLogs.map(log => (
                      <div key={log.id} className="flex items-center gap-2">
                        {log.status === 'pending' && <span className="text-muted-foreground">⏳</span>}
                        {log.status === 'uploading' && <Loader2 className="h-3 w-3 animate-spin" />}
                        {log.status === 'success' && <span className="text-green-500">✓</span>}
                        {log.status === 'error' && <span className="text-red-500">✗</span>}
                        <span>{log.title}</span>
                        {log.message && <span className="text-muted-foreground text-xs">({log.message})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Button onClick={startMigration} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Migrar {unmigratedProjects.length} Projetos Agora
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Migration from Projects Table Alert */}
        {unmigratedFromProjectsTable.length > 0 && (
          <Alert className="border-blue-500 bg-blue-500/10">
            <Upload className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-blue-600">Migrar Imóveis para Portfolio</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>
                Foram encontrados <strong>{unmigratedFromProjectsTable.length}</strong> imóveis na tabela <code className="bg-muted px-1 rounded">projects</code> que podem ser migrados para o Portfolio.
              </p>
              
              {isMigratingFromProjects ? (
                <div className="space-y-2">
                  <Progress value={migrationProgress} className="h-2" />
                  <div className="text-sm max-h-40 overflow-y-auto">
                    {migrationLogs.map(log => (
                      <div key={log.id} className="flex items-center gap-2">
                        {log.status === 'pending' && <span className="text-muted-foreground">⏳</span>}
                        {log.status === 'uploading' && <Loader2 className="h-3 w-3 animate-spin" />}
                        {log.status === 'success' && <span className="text-green-500">✓</span>}
                        {log.status === 'error' && <span className="text-red-500">✗</span>}
                        <span>{log.title}</span>
                        {log.message && <span className="text-muted-foreground text-xs">({log.message})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Button onClick={migrateFromProjectsTable} className="gap-2" variant="outline">
                  <Upload className="h-4 w-4" />
                  Migrar {unmigratedFromProjectsTable.length} Imóveis para Portfolio
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Settings Card */}
        <Card>
          <CardHeader className="p-4 sm:p-6 3xl:p-8">
            <CardTitle className="text-lg 3xl:text-xl 4xl:text-2xl">Configurações de Exibição</CardTitle>
            <CardDescription className="3xl:text-base">Configure como o Portfolio é apresentado no site público</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 3xl:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 3xl:gap-6 4xl:gap-8">
              <div className="space-y-2">
                <Label className="3xl:text-base">Projetos por página</Label>
                <Select
                  value={String(settings.projects_per_page)}
                  onValueChange={(v) => setSettings(prev => ({ ...prev, projects_per_page: Number(v) }))}
                >
                  <SelectTrigger className="min-h-touch 3xl:min-h-touch-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="9">9</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="18">18</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="3xl:text-base">Ordenação padrão</Label>
                <Select
                  value={settings.default_sort}
                  onValueChange={(v) => setSettings(prev => ({ ...prev, default_sort: v as SortOption }))}
                >
                  <SelectTrigger className="min-h-touch 3xl:min-h-touch-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Mais recentes</SelectItem>
                    <SelectItem value="date-asc">Mais antigos</SelectItem>
                    <SelectItem value="name-asc">Nome A-Z</SelectItem>
                    <SelectItem value="name-desc">Nome Z-A</SelectItem>
                    <SelectItem value="price-asc">Preço crescente</SelectItem>
                    <SelectItem value="price-desc">Preço decrescente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>

            <div className="mt-6 flex justify-end">
              <Button 
                className="min-h-touch 3xl:min-h-touch-lg"
                onClick={() => saveSettingsMutation.mutate(settings)}
                disabled={saveSettingsMutation.isPending}
              >
                {saveSettingsMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 3xl:h-5 3xl:w-5 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4 3xl:h-5 3xl:w-5" />
                )}
                Guardar Configurações
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 3xl:gap-6 4xl:gap-8">
          <Card>
            <CardContent className="pt-6 3xl:pt-8">
              <div className="text-2xl 3xl:text-3xl 4xl:text-4xl font-bold">{portfolioProjects?.length || 0}</div>
              <p className="text-sm 3xl:text-base text-muted-foreground">Total de Projetos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 3xl:pt-8">
              <div className="text-2xl 3xl:text-3xl 4xl:text-4xl font-bold">{portfolioProjects?.filter(p => p.status === 'active').length || 0}</div>
              <p className="text-sm 3xl:text-base text-muted-foreground">Ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 3xl:pt-8">
              <div className="text-2xl 3xl:text-3xl 4xl:text-4xl font-bold">{portfolioProjects?.filter(p => p.featured).length || 0}</div>
              <p className="text-sm 3xl:text-base text-muted-foreground">Em Destaque</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 3xl:pt-8">
              <div className="text-2xl 3xl:text-3xl 4xl:text-4xl font-bold text-amber-500">{unmigratedProjects.length}</div>
              <p className="text-sm 3xl:text-base text-muted-foreground">Pendentes Migração</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 3xl:h-5 3xl:w-5 text-muted-foreground" />
          <Input
            placeholder="Pesquisar projetos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 min-h-touch 3xl:min-h-touch-lg 3xl:text-base"
          />
        </div>

        {/* Projects Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 3xl:h-12 3xl:w-12 animate-spin text-primary" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground 3xl:text-lg">Nenhum projeto no Portfolio.</p>
              <Button className="mt-4 min-h-touch 3xl:min-h-touch-lg" onClick={() => navigate('/admin/portfolio/new')}>
                <Plus className="mr-2 h-4 w-4 3xl:h-5 3xl:w-5" />
                Criar Primeiro Projeto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Imagem</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Destaque</TableHead>
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
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs">
                          N/A
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{project.title_pt}</TableCell>
                    <TableCell>{project.location}</TableCell>
                    <TableCell>
                      {project.price ? `€${project.price.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status === 'active' ? 'Ativo' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={project.featured || false}
                        onCheckedChange={(checked) => 
                          toggleFeaturedMutation.mutate({ id: project.id, featured: checked })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <div className="flex justify-end gap-1">
                          {/* Pausar/Ativar */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={project.status === 'active' ? 'ghost' : 'outline'}
                                size="icon"
                                className={`min-h-touch 3xl:min-h-touch-lg ${project.status === 'active' ? 'text-orange-500 hover:text-orange-600 hover:bg-orange-50' : 'text-green-500 hover:text-green-600 hover:bg-green-50'}`}
                                disabled={toggleStatusMutation.isPending}
                                onClick={() => toggleStatusMutation.mutate({
                                  id: project.id,
                                  newStatus: project.status === 'active' ? 'draft' : 'active'
                                })}
                              >
                                {toggleStatusMutation.isPending && toggleStatusMutation.variables?.id === project.id ? (
                                  <Loader2 className="h-4 w-4 3xl:h-5 3xl:w-5 animate-spin" />
                                ) : project.status === 'active' ? (
                                  <Pause className="h-4 w-4 3xl:h-5 3xl:w-5" />
                                ) : (
                                  <Play className="h-4 w-4 3xl:h-5 3xl:w-5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {project.status === 'active' ? 'Pausar projeto' : 'Ativar projeto'}
                            </TooltipContent>
                          </Tooltip>

                          {/* Editar */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="min-h-touch 3xl:min-h-touch-lg text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                onClick={() => navigate(`/admin/portfolio/edit/${project.id}`)}
                              >
                                <Pencil className="h-4 w-4 3xl:h-5 3xl:w-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar projeto</TooltipContent>
                          </Tooltip>

                          {/* Ver no site */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="min-h-touch 3xl:min-h-touch-lg text-muted-foreground hover:text-foreground"
                                asChild
                              >
                                <Link to={`/portfolio/${project.id}`} target="_blank">
                                  <Eye className="h-4 w-4 3xl:h-5 3xl:w-5" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver no site</TooltipContent>
                          </Tooltip>

                          {/* Apagar */}
                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="min-h-touch 3xl:min-h-touch-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 3xl:h-5 3xl:w-5" />
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Eliminar projeto</TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar Projeto</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja eliminar permanentemente o projeto <strong>"{project.title_pt}"</strong>? 
                                  Esta ação não pode ser desfeita e todas as imagens serão removidas.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => deleteMutation.mutate(project.id)}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

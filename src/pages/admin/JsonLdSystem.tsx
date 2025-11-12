import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { generatePropertyJsonLd, validateJsonLd, formatJsonLd } from "@/utils/jsonLdUtils";
import { JsonLdPreview } from "@/components/admin/JsonLdPreview";
import { 
  FileJson, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Code,
  Wand2
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const JsonLdSystem = () => {
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [editingJsonLd, setEditingJsonLd] = useState<string>('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch all projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects-jsonld'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Generate JSON-LD for all properties
  const generateAllMutation = useMutation({
    mutationFn: async () => {
      if (!projects) return;

      const updates = projects.map(async (project) => {
        const jsonLd = generatePropertyJsonLd(project);
        
        const { error } = await supabase
          .from('projects')
          .update({ json_ld: jsonLd })
          .eq('id', project.id);
        
        if (error) throw error;
      });

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-jsonld'] });
      toast.success('JSON-LD gerado com sucesso', {
        description: `${projects?.length || 0} propriedades atualizadas`
      });
    },
    onError: (error) => {
      toast.error('Erro ao gerar JSON-LD', {
        description: error.message
      });
    }
  });

  // Generate JSON-LD for single property
  const generateSingleMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const project = projects?.find(p => p.id === projectId);
      if (!project) throw new Error('Project not found');

      const jsonLd = generatePropertyJsonLd(project);
      
      const { error } = await supabase
        .from('projects')
        .update({ json_ld: jsonLd })
        .eq('id', projectId);
      
      if (error) throw error;
      return jsonLd;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-jsonld'] });
      toast.success('JSON-LD gerado com sucesso');
    }
  });

  // Update JSON-LD manually
  const updateJsonLdMutation = useMutation({
    mutationFn: async ({ projectId, jsonLd }: { projectId: string; jsonLd: any }) => {
      const { error } = await supabase
        .from('projects')
        .update({ json_ld: jsonLd })
        .eq('id', projectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-jsonld'] });
      setIsEditDialogOpen(false);
      toast.success('JSON-LD atualizado com sucesso');
    }
  });

  const handleEditJsonLd = (property: any) => {
    setSelectedProperty(property);
    setEditingJsonLd(property.json_ld ? formatJsonLd(property.json_ld) : '');
    setIsEditDialogOpen(true);
  };

  const handleSaveJsonLd = () => {
    try {
      const parsed = JSON.parse(editingJsonLd);
      const validation = validateJsonLd(parsed);
      
      if (!validation.valid) {
        toast.error('JSON-LD inválido', {
          description: validation.errors.join(', ')
        });
        return;
      }

      updateJsonLdMutation.mutate({
        projectId: selectedProperty.id,
        jsonLd: parsed
      });
    } catch (error) {
      toast.error('JSON inválido', {
        description: 'Verifique a sintaxe do JSON'
      });
    }
  };

  const handleExportAll = () => {
    if (!projects) return;

    const exportData = projects
      .filter(p => p.json_ld)
      .map(p => ({
        id: p.id,
        title: p.title_pt,
        json_ld: p.json_ld
      }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `json-ld-export-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Exportação concluída');
  };

  const stats = {
    total: projects?.length || 0,
    withJsonLd: projects?.filter(p => p.json_ld).length || 0,
    withoutJsonLd: projects?.filter(p => !p.json_ld).length || 0,
    valid: projects?.filter(p => p.json_ld && validateJsonLd(p.json_ld).valid).length || 0
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sistema JSON-LD</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie dados estruturados para SEO dos seus imóveis
            </p>
          </div>
          <Button onClick={handleExportAll} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Tudo
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <FileJson className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Propriedades</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Com JSON-LD</p>
                <p className="text-2xl font-bold">{stats.withJsonLd}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Sem JSON-LD</p>
                <p className="text-2xl font-bold">{stats.withoutJsonLd}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Wand2 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">JSON-LD Válido</p>
                <p className="text-2xl font-bold">{stats.valid}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
          <div className="flex gap-3">
            <Button 
              onClick={() => generateAllMutation.mutate()}
              disabled={generateAllMutation.isPending}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${generateAllMutation.isPending ? 'animate-spin' : ''}`} />
              Gerar JSON-LD para Todas
            </Button>
            <Alert className="flex-1">
              <AlertDescription>
                Esta ação irá gerar/atualizar automaticamente o JSON-LD para todas as propriedades
              </AlertDescription>
            </Alert>
          </div>
        </Card>

        {/* Properties List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Propriedades</h2>
          
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Carregando...</p>
          ) : (
            <div className="space-y-3">
              {projects?.map((project) => {
                const hasJsonLd = !!project.json_ld;
                const validation = hasJsonLd ? validateJsonLd(project.json_ld) : null;
                
                return (
                  <Card key={project.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{project.title_pt}</h3>
                          {hasJsonLd ? (
                            validation?.valid ? (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Válido
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Inválido
                              </Badge>
                            )
                          ) : (
                            <Badge variant="outline">Sem JSON-LD</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{project.location}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateSingleMutation.mutate(project.id)}
                          disabled={generateSingleMutation.isPending}
                        >
                          <RefreshCw className={`h-4 w-4 ${generateSingleMutation.isPending ? 'animate-spin' : ''}`} />
                        </Button>
                        
                        <Dialog open={isEditDialogOpen && selectedProperty?.id === project.id} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditJsonLd(project)}
                            >
                              <Code className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Editar JSON-LD</DialogTitle>
                              <DialogDescription>
                                {selectedProperty?.title_pt}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <Tabs defaultValue="edit">
                              <TabsList>
                                <TabsTrigger value="edit">Editar</TabsTrigger>
                                <TabsTrigger value="preview">Preview</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="edit" className="space-y-4">
                                <Textarea
                                  value={editingJsonLd}
                                  onChange={(e) => setEditingJsonLd(e.target.value)}
                                  className="font-mono text-sm min-h-[400px]"
                                />
                                <div className="flex gap-2">
                                  <Button onClick={handleSaveJsonLd}>
                                    Salvar
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setIsEditDialogOpen(false)}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="preview">
                                <JsonLdPreview jsonLd={project.json_ld} />
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default JsonLdSystem;

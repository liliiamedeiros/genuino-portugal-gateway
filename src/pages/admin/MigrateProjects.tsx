import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { projects } from '@/data/projects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface MigrationLog {
  projectId: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

export default function MigrateProjects() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<MigrationLog[]>([]);
  const [dryRun, setDryRun] = useState(false);

  const addLog = (log: MigrationLog) => {
    setLogs(prev => [...prev, log]);
  };

  const uploadImageToStorage = async (imageUrl: string, projectId: string, filename: string) => {
    try {
      // Fetch the image from the asset
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const filePath = `${projectId}/${filename}`;
      const { data, error } = await supabase.storage
        .from('project-images')
        .upload(filePath, blob, {
          contentType: blob.type,
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const migrateProject = async (project: typeof projects[0]) => {
    addLog({
      projectId: project.id,
      status: 'warning',
      message: `Iniciando migração de "${project.title.pt}"...`
    });

    try {
      // 1. Upload main image
      const mainImageUrl = await uploadImageToStorage(
        project.mainImage,
        project.id,
        'main.jpg'
      );
      
      addLog({
        projectId: project.id,
        status: 'success',
        message: `Imagem principal carregada`
      });

      // 2. Upload gallery images
      const galleryUrls: string[] = [];
      for (let i = 0; i < project.gallery.length; i++) {
        const url = await uploadImageToStorage(
          project.gallery[i],
          project.id,
          `gallery-${i + 1}.jpg`
        );
        galleryUrls.push(url);
      }
      
      addLog({
        projectId: project.id,
        status: 'success',
        message: `${project.gallery.length} imagens da galeria carregadas`
      });

      if (dryRun) {
        addLog({
          projectId: project.id,
          status: 'warning',
          message: `[DRY RUN] Projeto NÃO foi inserido na base de dados`
        });
        return;
      }

      // 3. Insert project into database
      const { error: projectError } = await supabase
        .from('projects')
        .insert({
          id: project.id,
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
          operation_type: 'sale'
        });

      if (projectError) throw projectError;

      addLog({
        projectId: project.id,
        status: 'success',
        message: `Projeto inserido na base de dados`
      });

      // 4. Insert gallery images
      const galleryData = galleryUrls.map((url, index) => ({
        project_id: project.id,
        image_url: url,
        order_index: index
      }));

      const { error: galleryError } = await supabase
        .from('project_images')
        .insert(galleryData);

      if (galleryError) throw galleryError;

      addLog({
        projectId: project.id,
        status: 'success',
        message: `✅ Migração concluída com sucesso!`
      });

    } catch (error: any) {
      addLog({
        projectId: project.id,
        status: 'error',
        message: `❌ Erro: ${error.message}`
      });
      throw error;
    }
  };

  const startMigration = async () => {
    setIsMigrating(true);
    setProgress(0);
    setLogs([]);

    try {
      for (let i = 0; i < projects.length; i++) {
        await migrateProject(projects[i]);
        setProgress(((i + 1) / projects.length) * 100);
      }

      toast.success(`Migração ${dryRun ? '(simulação)' : ''} concluída! ${projects.length} projetos processados.`);
    } catch (error: any) {
      toast.error(`Erro durante migração: ${error.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Migração de Projetos</h1>
          <p className="text-muted-foreground">
            Migrar {projects.length} projetos estáticos para o banco de dados Supabase
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Controle de Migração</CardTitle>
            <CardDescription>
              Esta ferramenta irá migrar todos os projetos estáticos do arquivo projects.ts
              para a base de dados, incluindo upload de todas as imagens para o Storage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={startMigration}
                disabled={isMigrating}
                size="lg"
              >
                {isMigrating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migrando...
                  </>
                ) : (
                  <>Iniciar Migração de {projects.length} Projetos</>
                )}
              </Button>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  disabled={isMigrating}
                  className="w-4 h-4"
                />
                <span className="text-sm">Modo de Simulação (Dry Run)</span>
              </label>
            </div>

            {isMigrating && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground">
                  Progresso: {Math.round(progress)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Log de Migração</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm p-2 rounded-md bg-muted/50"
                  >
                    {log.status === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    )}
                    {log.status === 'error' && (
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                    )}
                    {log.status === 'warning' && (
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <span className="font-medium">{log.projectId}:</span>{' '}
                      {log.message}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

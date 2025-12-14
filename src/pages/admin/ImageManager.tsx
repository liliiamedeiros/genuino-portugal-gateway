import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Image as ImageIcon, 
  RefreshCw, 
  Check, 
  X, 
  AlertCircle, 
  Download,
  Eye,
  Loader2,
  FileImage,
  HardDrive,
  TrendingDown
} from 'lucide-react';
import { convertToWebP } from '@/utils/imageUtils';

interface ImageRecord {
  id: string;
  url: string;
  sourceTable: string;
  sourceId: string;
  format: string;
  isWebP: boolean;
}

interface ConversionRecord {
  id: string;
  source_table: string;
  source_id: string;
  original_url: string;
  converted_url: string | null;
  backup_url: string | null;
  original_format: string;
  original_size: number | null;
  converted_size: number | null;
  savings_percentage: number | null;
  status: string;
  error_message: string | null;
  converted_at: string | null;
  created_at: string;
}

export default function ImageManager() {
  const queryClient = useQueryClient();
  const [filterTable, setFilterTable] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [convertingIds, setConvertingIds] = useState<Set<string>>(new Set());

  // Fetch all images from different tables
  const { data: allImages, isLoading: loadingImages } = useQuery({
    queryKey: ['all-images'],
    queryFn: async () => {
      const images: ImageRecord[] = [];

      // Fetch from projects (main_image)
      const { data: projects } = await supabase
        .from('projects')
        .select('id, main_image')
        .not('main_image', 'is', null);
      
      projects?.forEach(p => {
        if (p.main_image) {
          const format = getImageFormat(p.main_image);
          images.push({
            id: `projects-main-${p.id}`,
            url: p.main_image,
            sourceTable: 'projects',
            sourceId: p.id,
            format,
            isWebP: format === 'WEBP'
          });
        }
      });

      // Fetch from project_images
      const { data: projectImages } = await supabase
        .from('project_images')
        .select('id, image_url, project_id');
      
      projectImages?.forEach(pi => {
        const format = getImageFormat(pi.image_url);
        images.push({
          id: `project_images-${pi.id}`,
          url: pi.image_url,
          sourceTable: 'project_images',
          sourceId: pi.id,
          format,
          isWebP: format === 'WEBP'
        });
      });

      // Fetch from portfolio_projects (main_image)
      const { data: portfolioProjects } = await supabase
        .from('portfolio_projects')
        .select('id, main_image');
      
      portfolioProjects?.forEach(pp => {
        if (pp.main_image) {
          const format = getImageFormat(pp.main_image);
          images.push({
            id: `portfolio_projects-main-${pp.id}`,
            url: pp.main_image,
            sourceTable: 'portfolio_projects',
            sourceId: pp.id,
            format,
            isWebP: format === 'WEBP'
          });
        }
      });

      // Fetch from portfolio_images
      const { data: portfolioImages } = await supabase
        .from('portfolio_images')
        .select('id, image_url, portfolio_id');
      
      portfolioImages?.forEach(pimg => {
        const format = getImageFormat(pimg.image_url);
        images.push({
          id: `portfolio_images-${pimg.id}`,
          url: pimg.image_url,
          sourceTable: 'portfolio_images',
          sourceId: pimg.id,
          format,
          isWebP: format === 'WEBP'
        });
      });

      return images;
    }
  });

  // Fetch conversion records
  const { data: conversions } = useQuery({
    queryKey: ['image-conversions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('image_conversions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ConversionRecord[];
    }
  });

  // Convert single image
  const convertImageMutation = useMutation({
    mutationFn: async (image: ImageRecord) => {
      setConvertingIds(prev => new Set(prev).add(image.id));
      
      try {
        // Download the image
        const response = await fetch(image.url);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: blob.type });
        
        // Convert to WebP using existing utility
        const webpBlob = await convertToWebP(file, 1200, 900);
        
        // Generate new filename
        const timestamp = Date.now();
        const newPath = `${image.sourceTable}/${image.sourceId}/converted-${timestamp}.webp`;
        
        // Upload converted image
        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(newPath, webpBlob, {
            contentType: 'image/webp',
            upsert: true
          });
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('project-images')
          .getPublicUrl(newPath);
        
        const newUrl = urlData.publicUrl;
        
        // Update the source record
        if (image.sourceTable === 'projects') {
          await supabase
            .from('projects')
            .update({ main_image: newUrl })
            .eq('id', image.sourceId);
        } else if (image.sourceTable === 'project_images') {
          await supabase
            .from('project_images')
            .update({ image_url: newUrl })
            .eq('id', image.sourceId);
        } else if (image.sourceTable === 'portfolio_projects') {
          await supabase
            .from('portfolio_projects')
            .update({ main_image: newUrl })
            .eq('id', image.sourceId);
        } else if (image.sourceTable === 'portfolio_images') {
          await supabase
            .from('portfolio_images')
            .update({ image_url: newUrl })
            .eq('id', image.sourceId);
        }
        
        // Record the conversion
        const originalSize = blob.size;
        const convertedSize = webpBlob.size;
        const savings = ((originalSize - convertedSize) / originalSize) * 100;
        
        await supabase.from('image_conversions').insert({
          source_table: image.sourceTable,
          source_id: image.sourceId,
          original_url: image.url,
          converted_url: newUrl,
          original_format: image.format,
          original_size: originalSize,
          converted_size: convertedSize,
          savings_percentage: Math.round(savings),
          status: 'converted',
          converted_at: new Date().toISOString()
        });
        
        return { success: true, savings: Math.round(savings) };
      } finally {
        setConvertingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(image.id);
          return newSet;
        });
      }
    },
    onSuccess: (result) => {
      toast.success(`Imagem convertida com sucesso! Poupança: ${result.savings}%`);
      queryClient.invalidateQueries({ queryKey: ['all-images'] });
      queryClient.invalidateQueries({ queryKey: ['image-conversions'] });
    },
    onError: (error: Error) => {
      toast.error(`Erro na conversão: ${error.message}`);
    }
  });

  // Batch convert all non-WEBP images
  const batchConvertMutation = useMutation({
    mutationFn: async () => {
      const nonWebpImages = filteredImages?.filter(img => !img.isWebP) || [];
      let successCount = 0;
      let errorCount = 0;
      
      for (const image of nonWebpImages) {
        try {
          await convertImageMutation.mutateAsync(image);
          successCount++;
        } catch {
          errorCount++;
        }
      }
      
      return { successCount, errorCount };
    },
    onSuccess: (result) => {
      toast.success(`Conversão em lote concluída: ${result.successCount} sucesso, ${result.errorCount} erros`);
    }
  });

  // Helper function to extract format from URL
  function getImageFormat(url: string): string {
    const extension = url.split('.').pop()?.split('?')[0]?.toUpperCase() || 'UNKNOWN';
    if (extension === 'JPG') return 'JPEG';
    return extension;
  }

  // Filter images
  const filteredImages = allImages?.filter(img => {
    if (filterTable !== 'all' && img.sourceTable !== filterTable) return false;
    if (filterFormat === 'webp' && !img.isWebP) return false;
    if (filterFormat === 'other' && img.isWebP) return false;
    return true;
  });

  // Stats
  const totalImages = allImages?.length || 0;
  const webpCount = allImages?.filter(img => img.isWebP).length || 0;
  const pendingCount = totalImages - webpCount;
  const webpPercentage = totalImages > 0 ? Math.round((webpCount / totalImages) * 100) : 0;

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 3xl:p-10 4xl:p-12 space-y-6 3xl:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl 3xl:text-4xl font-bold">Gestor de Imagens</h1>
            <p className="text-muted-foreground 3xl:text-lg">Gerir e converter imagens para formato WEBP</p>
          </div>
          <Button
            onClick={() => batchConvertMutation.mutate()}
            disabled={batchConvertMutation.isPending || pendingCount === 0}
            className="min-h-touch 3xl:min-h-touch-lg"
          >
            {batchConvertMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Converter Todas ({pendingCount})
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 3xl:gap-6">
          <Card>
            <CardContent className="p-4 3xl:p-6">
              <div className="flex items-center gap-3">
                <FileImage className="h-8 w-8 3xl:h-10 3xl:w-10 text-primary" />
                <div>
                  <p className="text-2xl 3xl:text-3xl font-bold">{totalImages}</p>
                  <p className="text-sm 3xl:text-base text-muted-foreground">Total de Imagens</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 3xl:p-6">
              <div className="flex items-center gap-3">
                <Check className="h-8 w-8 3xl:h-10 3xl:w-10 text-green-500" />
                <div>
                  <p className="text-2xl 3xl:text-3xl font-bold">{webpCount}</p>
                  <p className="text-sm 3xl:text-base text-muted-foreground">Em WEBP ({webpPercentage}%)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 3xl:p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 3xl:h-10 3xl:w-10 text-yellow-500" />
                <div>
                  <p className="text-2xl 3xl:text-3xl font-bold">{pendingCount}</p>
                  <p className="text-sm 3xl:text-base text-muted-foreground">A Converter</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 3xl:p-6">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-8 w-8 3xl:h-10 3xl:w-10 text-blue-500" />
                <div>
                  <p className="text-2xl 3xl:text-3xl font-bold">
                    {conversions?.length ? 
                      `${Math.round(conversions.reduce((acc, c) => acc + (c.savings_percentage || 0), 0) / conversions.length)}%` 
                      : '0%'}
                  </p>
                  <p className="text-sm 3xl:text-base text-muted-foreground">Poupança Média</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg 3xl:text-xl">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Select value={filterTable} onValueChange={setFilterTable}>
                <SelectTrigger className="w-[200px] min-h-touch">
                  <SelectValue placeholder="Tabela" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Tabelas</SelectItem>
                  <SelectItem value="projects">Imóveis (Principal)</SelectItem>
                  <SelectItem value="project_images">Imóveis (Galeria)</SelectItem>
                  <SelectItem value="portfolio_projects">Portfolio (Principal)</SelectItem>
                  <SelectItem value="portfolio_images">Portfolio (Galeria)</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterFormat} onValueChange={setFilterFormat}>
                <SelectTrigger className="w-[180px] min-h-touch">
                  <SelectValue placeholder="Formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Formatos</SelectItem>
                  <SelectItem value="webp">WEBP ✓</SelectItem>
                  <SelectItem value="other">Outros (JPEG/PNG)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Images Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg 3xl:text-xl">
              Lista de Imagens ({filteredImages?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingImages ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Preview</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Formato</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredImages?.map((image) => (
                      <TableRow key={image.id}>
                        <TableCell>
                          <div 
                            className="w-12 h-12 3xl:w-16 3xl:h-16 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              setSelectedImage(image);
                              setShowPreview(true);
                            }}
                          >
                            <img 
                              src={image.url} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm 3xl:text-base">
                            <p className="font-medium">{image.sourceTable}</p>
                            <p className="text-muted-foreground text-xs 3xl:text-sm truncate max-w-[200px]">
                              {image.sourceId}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={image.isWebP ? 'default' : 'secondary'}>
                            {image.format}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {image.isWebP ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <Check className="h-4 w-4" />
                              <span className="text-sm">Convertido</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-yellow-600">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm">Pendente</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedImage(image);
                                setShowPreview(true);
                              }}
                              className="min-h-touch min-w-touch"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!image.isWebP && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => convertImageMutation.mutate(image)}
                                disabled={convertingIds.has(image.id)}
                                className="min-h-touch"
                              >
                                {convertingIds.has(image.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    Converter
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversion History */}
        {conversions && conversions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg 3xl:text-xl">Histórico de Conversões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Origem</TableHead>
                      <TableHead>Formato</TableHead>
                      <TableHead>Tamanho Original</TableHead>
                      <TableHead>Tamanho WEBP</TableHead>
                      <TableHead>Poupança</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversions.slice(0, 10).map((conversion) => (
                      <TableRow key={conversion.id}>
                        <TableCell>
                          <span className="text-sm">{conversion.source_table}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{conversion.original_format}</Badge>
                        </TableCell>
                        <TableCell>
                          {conversion.original_size ? formatBytes(conversion.original_size) : '-'}
                        </TableCell>
                        <TableCell>
                          {conversion.converted_size ? formatBytes(conversion.converted_size) : '-'}
                        </TableCell>
                        <TableCell>
                          {conversion.savings_percentage ? (
                            <span className="text-green-600 font-medium">
                              -{conversion.savings_percentage}%
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={conversion.status === 'converted' ? 'default' : 'secondary'}>
                            {conversion.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {conversion.converted_at ? 
                            new Date(conversion.converted_at).toLocaleDateString('pt-PT') : 
                            '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Preview da Imagem</DialogTitle>
            </DialogHeader>
            {selectedImage && (
              <div className="space-y-4">
                <img 
                  src={selectedImage.url} 
                  alt="Preview" 
                  className="w-full max-h-[60vh] object-contain rounded-lg"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Formato: {selectedImage.format}</span>
                  <span>Origem: {selectedImage.sourceTable}</span>
                </div>
                {!selectedImage.isWebP && (
                  <Button
                    onClick={() => {
                      convertImageMutation.mutate(selectedImage);
                      setShowPreview(false);
                    }}
                    className="w-full"
                    disabled={convertingIds.has(selectedImage.id)}
                  >
                    {convertingIds.has(selectedImage.id) ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Converter para WEBP
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
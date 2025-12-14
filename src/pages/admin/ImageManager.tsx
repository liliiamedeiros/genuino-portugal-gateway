import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  TrendingDown,
  Undo2,
  RotateCcw,
  AlertTriangle,
  Clock,
  Calendar,
  Play,
  Pause,
  SplitSquareVertical,
  Settings,
  BarChart3,
  Bell,
  BellOff,
  TrendingUp
} from 'lucide-react';
import { convertToWebP } from '@/utils/imageUtils';
import { ImageComparisonSlider } from '@/components/admin/ImageComparisonSlider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, Legend } from 'recharts';

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

interface ConversionSchedule {
  id: string;
  schedule_time: string;
  days_of_week: number[];
  is_active: boolean;
  max_images_per_run: number;
  last_run_at: string | null;
  next_run_at: string | null;
  stats: unknown;
  notify_on_completion: boolean;
  notify_on_error: boolean;
}

interface StorageMetric {
  id: string;
  recorded_at: string;
  total_images: number;
  webp_images: number;
  other_images: number;
  conversions_count: number;
  savings_bytes: number;
  average_savings_percentage: number;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

export default function ImageManager() {
  const queryClient = useQueryClient();
  const [filterTable, setFilterTable] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [convertingIds, setConvertingIds] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<{original: string; converted: string; conversion: ConversionRecord} | null>(null);
  const [activeTab, setActiveTab] = useState('images');

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

  // Fetch conversion schedule
  const { data: schedule, isLoading: loadingSchedule } = useQuery({
    queryKey: ['conversion-schedule'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversion_schedules')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      return data as ConversionSchedule | null;
    }
  });

  // Fetch storage metrics for analytics
  const { data: storageMetrics } = useQuery({
    queryKey: ['storage-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('storage_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return (data as StorageMetric[])?.reverse() || [];
    }
  });

  // Create or update schedule
  const updateScheduleMutation = useMutation({
    mutationFn: async (scheduleData: { schedule_time?: string; days_of_week?: number[]; is_active?: boolean; max_images_per_run?: number }) => {
      if (schedule?.id) {
        const { error } = await supabase
          .from('conversion_schedules')
          .update(scheduleData)
          .eq('id', schedule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('conversion_schedules')
          .insert({
            schedule_time: scheduleData.schedule_time || '03:00:00',
            days_of_week: scheduleData.days_of_week || [0,1,2,3,4,5,6],
            is_active: scheduleData.is_active ?? false,
            max_images_per_run: scheduleData.max_images_per_run || 50
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Agendamento atualizado');
      queryClient.invalidateQueries({ queryKey: ['conversion-schedule'] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar agendamento: ${error.message}`);
    }
  });

  // Toggle schedule active status
  const toggleScheduleActive = () => {
    updateScheduleMutation.mutate({
      is_active: !schedule?.is_active
    });
  };

  // Open comparison modal
  const openComparison = (conversion: ConversionRecord) => {
    if (conversion.backup_url && conversion.converted_url) {
      setComparisonData({
        original: conversion.backup_url,
        converted: conversion.converted_url,
        conversion
      });
      setShowComparison(true);
    } else if (conversion.original_url && conversion.converted_url) {
      setComparisonData({
        original: conversion.original_url,
        converted: conversion.converted_url,
        conversion
      });
      setShowComparison(true);
    } else {
      toast.error('Dados de comparação não disponíveis');
    }
  };

  // Convert single image with backup
  const convertImageMutation = useMutation({
    mutationFn: async (image: ImageRecord) => {
      setConvertingIds(prev => new Set(prev).add(image.id));
      
      try {
        // Download the image
        const response = await fetch(image.url);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: blob.type });
        
        // Upload backup BEFORE conversion
        const backupTimestamp = Date.now();
        const backupPath = `backups/${image.sourceTable}/${image.sourceId}/${backupTimestamp}-original.${image.format.toLowerCase()}`;
        
        const { error: backupError } = await supabase.storage
          .from('project-images')
          .upload(backupPath, blob, {
            contentType: blob.type,
            upsert: true
          });
        
        let backupUrl: string | null = null;
        if (!backupError) {
          const { data: backupUrlData } = supabase.storage
            .from('project-images')
            .getPublicUrl(backupPath);
          backupUrl = backupUrlData.publicUrl;
        }
        
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
        
        // Record the conversion with backup URL
        const originalSize = blob.size;
        const convertedSize = webpBlob.size;
        const savings = ((originalSize - convertedSize) / originalSize) * 100;
        
        await supabase.from('image_conversions').insert({
          source_table: image.sourceTable,
          source_id: image.sourceId,
          original_url: image.url,
          converted_url: newUrl,
          backup_url: backupUrl,
          original_format: image.format,
          original_size: originalSize,
          converted_size: convertedSize,
          savings_percentage: Math.round(savings),
          status: 'converted',
          converted_at: new Date().toISOString()
        });
        
        return { success: true, savings: Math.round(savings) };
      } catch (error) {
        // Record the failed conversion
        await supabase.from('image_conversions').insert({
          source_table: image.sourceTable,
          source_id: image.sourceId,
          original_url: image.url,
          original_format: image.format,
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
        throw error;
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
      queryClient.invalidateQueries({ queryKey: ['image-conversions'] });
    }
  });

  // Retry failed conversion
  const retryConversionMutation = useMutation({
    mutationFn: async (conversion: ConversionRecord) => {
      // Delete the failed record first
      await supabase.from('image_conversions').delete().eq('id', conversion.id);
      
      // Create image record from conversion
      const image: ImageRecord = {
        id: `${conversion.source_table}-${conversion.source_id}`,
        url: conversion.original_url,
        sourceTable: conversion.source_table,
        sourceId: conversion.source_id,
        format: conversion.original_format,
        isWebP: false
      };
      
      // Retry conversion
      return convertImageMutation.mutateAsync(image);
    },
    onSuccess: () => {
      toast.success('Conversão repetida com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Retry falhou: ${error.message}`);
    }
  });

  // Restore backup
  const restoreBackupMutation = useMutation({
    mutationFn: async (conversion: ConversionRecord) => {
      if (!conversion.backup_url) {
        throw new Error('Backup não disponível para esta conversão');
      }
      
      // Update the source record with backup URL
      if (conversion.source_table === 'projects') {
        await supabase
          .from('projects')
          .update({ main_image: conversion.backup_url })
          .eq('id', conversion.source_id);
      } else if (conversion.source_table === 'project_images') {
        await supabase
          .from('project_images')
          .update({ image_url: conversion.backup_url })
          .eq('id', conversion.source_id);
      } else if (conversion.source_table === 'portfolio_projects') {
        await supabase
          .from('portfolio_projects')
          .update({ main_image: conversion.backup_url })
          .eq('id', conversion.source_id);
      } else if (conversion.source_table === 'portfolio_images') {
        await supabase
          .from('portfolio_images')
          .update({ image_url: conversion.backup_url })
          .eq('id', conversion.source_id);
      }
      
      // Update conversion status
      await supabase
        .from('image_conversions')
        .update({ status: 'restored' })
        .eq('id', conversion.id);
      
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Imagem original restaurada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['all-images'] });
      queryClient.invalidateQueries({ queryKey: ['image-conversions'] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao restaurar: ${error.message}`);
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

  // Filter conversions by status
  const filteredConversions = conversions?.filter(c => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  // Get failed conversions
  const failedConversions = conversions?.filter(c => c.status === 'failed') || [];
  const errorCount = failedConversions.length;

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'converted':
        return <Badge className="bg-green-500">Convertido</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhado</Badge>;
      case 'restored':
        return <Badge variant="outline">Restaurado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 3xl:p-10 4xl:p-12 space-y-6 3xl:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl 3xl:text-4xl font-bold">Gestor de Imagens</h1>
            <p className="text-muted-foreground 3xl:text-lg">Gerir e converter imagens para formato WEBP</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveTab('schedule')}
              className="min-h-touch"
            >
              <Clock className="h-4 w-4 mr-2" />
              Agendamento
            </Button>
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
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="images" className="min-h-touch">
              <FileImage className="h-4 w-4 mr-2" />
              Imagens
            </TabsTrigger>
            <TabsTrigger value="history" className="min-h-touch">
              <TrendingDown className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="analytics" className="min-h-touch">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="schedule" className="min-h-touch">
              <Clock className="h-4 w-4 mr-2" />
              Agendamento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 3xl:gap-6">
          <Card>
            <CardContent className="p-4 3xl:p-6">
              <div className="flex items-center gap-3">
                <FileImage className="h-8 w-8 3xl:h-10 3xl:w-10 text-primary" />
                <div>
                  <p className="text-2xl 3xl:text-3xl font-bold">{totalImages}</p>
                  <p className="text-sm 3xl:text-base text-muted-foreground">Total</p>
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
                  <p className="text-sm 3xl:text-base text-muted-foreground">WEBP ({webpPercentage}%)</p>
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
                  <p className="text-sm 3xl:text-base text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={errorCount > 0 ? 'border-destructive' : ''}>
            <CardContent className="p-4 3xl:p-6">
              <div className="flex items-center gap-3">
                <X className={`h-8 w-8 3xl:h-10 3xl:w-10 ${errorCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-2xl 3xl:text-3xl font-bold">{errorCount}</p>
                  <p className="text-sm 3xl:text-base text-muted-foreground">Erros</p>
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
                    {conversions?.filter(c => c.status === 'converted').length ? 
                      `${Math.round(conversions.filter(c => c.status === 'converted').reduce((acc, c) => acc + (c.savings_percentage || 0), 0) / conversions.filter(c => c.status === 'converted').length)}%` 
                      : '0%'}
                  </p>
                  <p className="text-sm 3xl:text-base text-muted-foreground">Poupança</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Panel */}
        {failedConversions.length > 0 && (
          <Card className="border-destructive bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Erros de Conversão ({failedConversions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Origem</TableHead>
                      <TableHead>Formato</TableHead>
                      <TableHead>Erro</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {failedConversions.map((conversion) => (
                      <TableRow key={conversion.id}>
                        <TableCell>
                          <span className="text-sm font-medium">{conversion.source_table}</span>
                          <span className="text-xs text-muted-foreground block truncate max-w-[150px]">
                            {conversion.source_id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{conversion.original_format}</Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded block max-w-[300px] truncate">
                            {conversion.error_message || 'Erro desconhecido'}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(conversion.created_at).toLocaleDateString('pt-PT')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => retryConversionMutation.mutate(conversion)}
                            disabled={retryConversionMutation.isPending}
                            className="min-h-touch"
                          >
                            {retryConversionMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Retry
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

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

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] min-h-touch">
                  <SelectValue placeholder="Estado Conversão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Estados</SelectItem>
                  <SelectItem value="converted">✅ Convertido</SelectItem>
                  <SelectItem value="failed">❌ Falhado</SelectItem>
                  <SelectItem value="restored">↩️ Restaurado</SelectItem>
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
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* Status Filter */}
            <Card>
              <CardContent className="p-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[200px] min-h-touch">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Estados</SelectItem>
                    <SelectItem value="converted">✅ Convertido</SelectItem>
                    <SelectItem value="failed">❌ Falhado</SelectItem>
                    <SelectItem value="restored">↩️ Restaurado</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Conversion History */}
            {filteredConversions && filteredConversions.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg 3xl:text-xl">
                    Histórico de Conversões ({filteredConversions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Origem</TableHead>
                          <TableHead>Formato</TableHead>
                          <TableHead>Tam. Original</TableHead>
                          <TableHead>Tam. WEBP</TableHead>
                          <TableHead>Poupança</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredConversions.slice(0, 50).map((conversion) => (
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
                              {getStatusBadge(conversion.status || 'pending')}
                            </TableCell>
                            <TableCell>
                              {conversion.converted_at ? 
                                new Date(conversion.converted_at).toLocaleDateString('pt-PT') : 
                                new Date(conversion.created_at).toLocaleDateString('pt-PT')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {conversion.status === 'converted' && conversion.converted_url && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openComparison(conversion)}
                                    className="min-h-touch"
                                    title="Comparar original vs WEBP"
                                  >
                                    <SplitSquareVertical className="h-4 w-4 mr-1" />
                                    Comparar
                                  </Button>
                                )}
                                {conversion.status === 'converted' && conversion.backup_url && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => restoreBackupMutation.mutate(conversion)}
                                    disabled={restoreBackupMutation.isPending}
                                    className="min-h-touch"
                                    title="Restaurar imagem original"
                                  >
                                    {restoreBackupMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Undo2 className="h-4 w-4 mr-1" />
                                        Restaurar
                                      </>
                                    )}
                                  </Button>
                                )}
                                {conversion.status === 'failed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => retryConversionMutation.mutate(conversion)}
                                    disabled={retryConversionMutation.isPending}
                                    className="min-h-touch"
                                  >
                                    {retryConversionMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <>
                                        <RotateCcw className="h-4 w-4 mr-1" />
                                        Retry
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
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma conversão encontrada</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <HardDrive className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {conversions?.reduce((acc, c) => acc + (c.original_size || 0), 0) 
                          ? formatBytes(conversions.reduce((acc, c) => acc + (c.original_size || 0), 0))
                          : '0 B'}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Processado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {conversions?.filter(c => c.status === 'converted').reduce((acc, c) => 
                          acc + ((c.original_size || 0) - (c.converted_size || 0)), 0)
                          ? formatBytes(conversions.filter(c => c.status === 'converted').reduce((acc, c) => 
                              acc + ((c.original_size || 0) - (c.converted_size || 0)), 0))
                          : '0 B'}
                      </p>
                      <p className="text-sm text-muted-foreground">Poupança Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">
                        {conversions?.filter(c => c.status === 'converted').length
                          ? `${Math.round(conversions.filter(c => c.status === 'converted')
                              .reduce((acc, c) => acc + (c.savings_percentage || 0), 0) / 
                              conversions.filter(c => c.status === 'converted').length)}%`
                          : '0%'}
                      </p>
                      <p className="text-sm text-muted-foreground">Poupança Média</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {conversions?.filter(c => c.status === 'converted').length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Convertidas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Conversions Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Conversões por Dia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {storageMetrics && storageMetrics.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={storageMetrics}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="recorded_at" 
                          tickFormatter={(v) => new Date(v).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })}
                          className="text-xs"
                        />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          labelFormatter={(v) => new Date(v).toLocaleDateString('pt-PT')}
                          formatter={(value: number) => [value, 'Conversões']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="conversions_count" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      <p>Sem dados suficientes para exibir gráfico</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Format Distribution Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileImage className="h-5 w-5" />
                    Distribuição de Formatos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {allImages && allImages.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'WEBP', value: allImages.filter(i => i.isWebP).length, fill: 'hsl(var(--primary))' },
                            { name: 'JPEG', value: allImages.filter(i => i.format === 'JPEG' || i.format === 'JPG').length, fill: 'hsl(var(--muted-foreground))' },
                            { name: 'PNG', value: allImages.filter(i => i.format === 'PNG').length, fill: 'hsl(var(--accent))' },
                            { name: 'Outros', value: allImages.filter(i => !i.isWebP && i.format !== 'JPEG' && i.format !== 'JPG' && i.format !== 'PNG').length, fill: 'hsl(var(--secondary))' },
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      <p>Sem imagens para analisar</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cumulative Savings */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Poupança Acumulada (últimos 30 dias)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {storageMetrics && storageMetrics.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={storageMetrics.map((m, idx) => ({
                        ...m,
                        cumulative_savings_mb: storageMetrics
                          .slice(0, idx + 1)
                          .reduce((acc, curr) => acc + (curr.savings_bytes || 0), 0) / (1024 * 1024)
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="recorded_at" 
                          tickFormatter={(v) => new Date(v).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })}
                          className="text-xs"
                        />
                        <YAxis 
                          tickFormatter={(v) => `${v.toFixed(1)} MB`}
                          className="text-xs"
                        />
                        <Tooltip 
                          labelFormatter={(v) => new Date(v).toLocaleDateString('pt-PT')}
                          formatter={(value: number) => [`${value.toFixed(2)} MB`, 'Poupança Acumulada']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="cumulative_savings_mb" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary) / 0.2)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      <p>Sem dados suficientes para exibir gráfico</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Agendamento Automático
                </CardTitle>
                <CardDescription>
                  Configure conversões automáticas em horários de baixo tráfego
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingSchedule ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Active Toggle */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {schedule?.is_active ? (
                          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                        ) : (
                          <div className="h-3 w-3 rounded-full bg-muted" />
                        )}
                        <div>
                          <p className="font-medium">
                            Estado: {schedule?.is_active ? 'Ativo' : 'Inativo'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {schedule?.is_active 
                              ? 'Conversões serão executadas automaticamente'
                              : 'Ative para iniciar conversões agendadas'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={schedule?.is_active ? 'destructive' : 'default'}
                        onClick={toggleScheduleActive}
                        disabled={updateScheduleMutation.isPending}
                        className="min-h-touch"
                      >
                        {updateScheduleMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : schedule?.is_active ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Ativar
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Schedule Configuration */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="schedule-time" className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Horário de Execução
                        </Label>
                        <Input
                          id="schedule-time"
                          type="time"
                          defaultValue={schedule?.schedule_time?.substring(0, 5) || '03:00'}
                          onChange={(e) => {
                            updateScheduleMutation.mutate({
                              schedule_time: e.target.value + ':00'
                            });
                          }}
                          className="min-h-touch"
                        />
                        <p className="text-xs text-muted-foreground">
                          Recomendado: entre 02:00 e 05:00 (baixo tráfego)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max-images" className="flex items-center gap-2">
                          <FileImage className="h-4 w-4" />
                          Máx. Imagens por Execução
                        </Label>
                        <Input
                          id="max-images"
                          type="number"
                          min={1}
                          max={200}
                          defaultValue={schedule?.max_images_per_run || 50}
                          onChange={(e) => {
                            updateScheduleMutation.mutate({
                              max_images_per_run: parseInt(e.target.value) || 50
                            });
                          }}
                          className="min-h-touch"
                        />
                        <p className="text-xs text-muted-foreground">
                          Limite de imagens para processar por execução
                        </p>
                      </div>
                    </div>

                    {/* Days of Week */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Dias da Semana
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <div
                            key={day.value}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`day-${day.value}`}
                              checked={schedule?.days_of_week?.includes(day.value) ?? true}
                              onCheckedChange={(checked) => {
                                const currentDays = schedule?.days_of_week || [0,1,2,3,4,5,6];
                                const newDays = checked
                                  ? [...currentDays, day.value]
                                  : currentDays.filter(d => d !== day.value);
                                updateScheduleMutation.mutate({
                                  days_of_week: newDays.sort()
                                });
                              }}
                            />
                            <label
                              htmlFor={`day-${day.value}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {day.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notifications Section */}
                    <Card className="border-dashed">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Notificações Push
                        </CardTitle>
                        <CardDescription>
                          Receba notificações quando as conversões automáticas terminarem
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Notificar quando concluir</p>
                              <p className="text-sm text-muted-foreground">
                                Receber notificação após conversões automáticas
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={schedule?.notify_on_completion ?? true}
                            onCheckedChange={(checked) => {
                              updateScheduleMutation.mutate({
                                notify_on_completion: checked
                              } as never);
                            }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Notificar em caso de erros</p>
                              <p className="text-sm text-muted-foreground">
                                Receber alerta se houver falhas na conversão
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={schedule?.notify_on_error ?? true}
                            onCheckedChange={(checked) => {
                              updateScheduleMutation.mutate({
                                notify_on_error: checked
                              } as never);
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Last Run Info */}
                    {schedule?.last_run_at && (
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <p className="text-sm">
                          <strong>Última execução:</strong>{' '}
                          {new Date(schedule.last_run_at).toLocaleString('pt-PT')}
                        </p>
                        {schedule.stats && typeof schedule.stats === 'object' && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Processadas: {String((schedule.stats as Record<string, number>).total_processed || 0)} imagens
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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

        {/* Comparison Dialog */}
        <Dialog open={showComparison} onOpenChange={setShowComparison}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <SplitSquareVertical className="h-5 w-5" />
                Comparação: Original vs WEBP
              </DialogTitle>
              <DialogDescription>
                Arraste o slider para comparar as duas versões
              </DialogDescription>
            </DialogHeader>
            {comparisonData && (
              <div className="space-y-4">
                <ImageComparisonSlider
                  originalUrl={comparisonData.original}
                  convertedUrl={comparisonData.converted}
                  originalLabel={comparisonData.conversion.original_format}
                  convertedLabel="WEBP"
                />
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="font-medium">Original</p>
                    <p className="text-muted-foreground">
                      {comparisonData.conversion.original_size 
                        ? formatBytes(comparisonData.conversion.original_size) 
                        : '-'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10 text-green-600">
                    <p className="font-medium">Poupança</p>
                    <p className="text-lg font-bold">
                      -{comparisonData.conversion.savings_percentage || 0}%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="font-medium">WEBP</p>
                    <p className="text-muted-foreground">
                      {comparisonData.conversion.converted_size 
                        ? formatBytes(comparisonData.conversion.converted_size) 
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

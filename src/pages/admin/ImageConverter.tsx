import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ImageDropzone } from '@/components/admin/ImageDropzone';
import { ImagePreviewCard } from '@/components/admin/ImagePreviewCard';
import { ConversionProgressBar } from '@/components/admin/ConversionProgressBar';
import { ConversionLog } from '@/components/admin/ConversionLog';
import { validateImageSize, analyzeImage, type ImageAnalysis } from '@/utils/imageUtils';
import { batchConvertImages, createConversionLog, type ConversionResult, type ConversionProgress } from '@/utils/imageConverterUtils';
import type { WatermarkConfig } from '@/utils/watermarkUtils';
import { FileImage, Download, Trash2, Settings2, CheckCircle2, XCircle, TrendingDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ImageWithAnalysis {
  file: File;
  preview: string;
  analysis: ImageAnalysis;
}

export default function ImageConverter() {
  const [images, setImages] = useState<ImageWithAnalysis[]>([]);
  const [quality, setQuality] = useState(85);
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkConfig['position']>('bottom-right');
  const [resizeOption, setResizeOption] = useState<'original' | '800x600' | '1200x900' | 'custom'>('800x600');
  const [customWidth, setCustomWidth] = useState(800);
  const [customHeight, setCustomHeight] = useState(600);
  const [deleteOriginals, setDeleteOriginals] = useState(false);
  
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<ConversionProgress | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleFilesSelected = async (files: File[]) => {
    const validatedImages: ImageWithAnalysis[] = [];

    for (const file of files) {
      const validation = validateImageSize(file);
      
      if (!validation.valid) {
        toast({
          title: 'Arquivo muito grande',
          description: validation.error,
          variant: 'destructive'
        });
        continue;
      }

      try {
        const analysis = await analyzeImage(file);
        validatedImages.push({
          file,
          preview: URL.createObjectURL(file),
          analysis
        });
      } catch (error) {
        toast({
          title: 'Erro ao analisar imagem',
          description: `${file.name} não pôde ser analisado`,
          variant: 'destructive'
        });
      }
    }

    setImages(prev => [...prev, ...validatedImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setLogs([]);
    setResults([]);
    setShowResults(false);
  };

  const handleConvert = async () => {
    if (images.length === 0) return;

    setIsConverting(true);
    setShowResults(false);
    setLogs([]);
    setResults([]);

    const dimensions = resizeOption === 'custom' 
      ? { width: customWidth, height: customHeight }
      : resizeOption === '1200x900'
      ? { width: 1200, height: 900 }
      : resizeOption === 'original'
      ? { width: 0, height: 0 } // Will be handled differently
      : { width: 800, height: 600 };

    const watermarkConfig: Partial<WatermarkConfig> = watermarkEnabled ? {
      enabled: true,
      position: watermarkPosition,
      text: '© Capital Estate Group',
      opacity: 0.7
    } : { enabled: false };

    const conversionResults = await batchConvertImages(
      images.map(img => img.file),
      {
        quality,
        targetWidth: dimensions.width || 800,
        targetHeight: dimensions.height || 600,
        watermarkConfig,
        onProgress: (prog) => {
          setProgress(prog);
        },
        onFileComplete: (result) => {
          const log = createConversionLog(result);
          setLogs(prev => [...prev, log]);
        }
      }
    );

    setResults(conversionResults);
    setIsConverting(false);
    setShowResults(true);
    setProgress(null);

    const successCount = conversionResults.filter(r => r.status === 'success').length;
    const errorCount = conversionResults.filter(r => r.status === 'error').length;

    toast({
      title: 'Conversão concluída',
      description: `${successCount} imagens convertidas com sucesso${errorCount > 0 ? `, ${errorCount} erros` : ''}`,
    });
  };

  const downloadAll = () => {
    results.forEach(result => {
      if (result.status === 'success' && result.blob) {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  const totalOriginalSize = images.reduce((sum, img) => sum + img.analysis.size, 0);
  const totalEstimatedWebP = images.reduce((sum, img) => sum + img.analysis.estimatedWebPSize, 0);
  const totalEstimatedSavings = totalOriginalSize > 0 
    ? Math.round(((totalOriginalSize - totalEstimatedWebP) / totalOriginalSize) * 100)
    : 0;

  const successResults = results.filter(r => r.status === 'success');
  const errorResults = results.filter(r => r.status === 'error');
  const totalSavedBytes = successResults.reduce((sum, r) => sum + (r.oldSize - r.newSize), 0);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Conversor de Imagens</h1>
          <p className="text-muted-foreground">
            Converta imagens para WebP com compressão otimizada e marca d'água
          </p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              Upload de Imagens
            </CardTitle>
            <CardDescription>
              Selecione até 50 imagens para conversão (máximo 20MB cada)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageDropzone
              onFilesSelected={handleFilesSelected}
              disabled={isConverting}
            />
          </CardContent>
        </Card>

        {/* Preview and Statistics */}
        {images.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Imagens Selecionadas</CardTitle>
                    <CardDescription>
                      {images.length} {images.length === 1 ? 'imagem' : 'imagens'} pronta{images.length === 1 ? '' : 's'} para conversão
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    disabled={isConverting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Tudo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {images.map((img, index) => (
                    <ImagePreviewCard
                      key={index}
                      preview={img.preview}
                      analysis={img.analysis}
                      onRemove={() => removeImage(index)}
                    />
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <FileImage className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-2xl font-bold">{images.length}</p>
                        <p className="text-sm text-muted-foreground">Total de Imagens</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatBytes(totalOriginalSize)}</div>
                        <p className="text-sm text-muted-foreground">Tamanho Atual</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          → {formatBytes(totalEstimatedWebP)} após WebP
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-500/10 border-green-500/20">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <TrendingDown className="h-5 w-5 text-green-600" />
                          <span className="text-2xl font-bold text-green-600">
                            {totalEstimatedSavings}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Economia Estimada</p>
                        <p className="text-xs text-green-600 font-medium mt-1">
                          ~{formatBytes(totalOriginalSize - totalEstimatedWebP)} economizados
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Configurações de Conversão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Qualidade da Compressão: {quality}%</Label>
                  <Slider
                    value={[quality]}
                    onValueChange={(value) => setQuality(value[0])}
                    min={50}
                    max={100}
                    step={5}
                    disabled={isConverting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Menor = mais compressão e menor tamanho | Maior = melhor qualidade
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="watermark"
                      checked={watermarkEnabled}
                      onCheckedChange={(checked) => setWatermarkEnabled(checked as boolean)}
                      disabled={isConverting}
                    />
                    <Label htmlFor="watermark">Aplicar marca d'água</Label>
                  </div>

                  {watermarkEnabled && (
                    <div className="ml-6 space-y-2">
                      <Label>Posição da Marca d'Água</Label>
                      <Select
                        value={watermarkPosition}
                        onValueChange={(value: any) => setWatermarkPosition(value)}
                        disabled={isConverting}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom-right">Inferior Direito</SelectItem>
                          <SelectItem value="bottom-left">Inferior Esquerdo</SelectItem>
                          <SelectItem value="top-right">Superior Direito</SelectItem>
                          <SelectItem value="top-left">Superior Esquerdo</SelectItem>
                          <SelectItem value="center">Centro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <Label>Redimensionar para:</Label>
                    <Select
                      value={resizeOption}
                      onValueChange={(value: any) => setResizeOption(value)}
                      disabled={isConverting}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Manter tamanho original</SelectItem>
                        <SelectItem value="800x600">800x600px (Padrão do site)</SelectItem>
                        <SelectItem value="1200x900">1200x900px (Alta resolução)</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {resizeOption === 'custom' && (
                    <div className="ml-6 grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="custom-width">Largura (px)</Label>
                        <input
                          id="custom-width"
                          type="number"
                          value={customWidth}
                          onChange={(e) => setCustomWidth(parseInt(e.target.value) || 800)}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          disabled={isConverting}
                          min={100}
                          max={4000}
                        />
                      </div>
                      <div>
                        <Label htmlFor="custom-height">Altura (px)</Label>
                        <input
                          id="custom-height"
                          type="number"
                          value={customHeight}
                          onChange={(e) => setCustomHeight(parseInt(e.target.value) || 600)}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          disabled={isConverting}
                          min={100}
                          max={4000}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <Alert>
                  <AlertDescription className="flex items-center gap-2">
                    <Checkbox
                      id="delete-originals"
                      checked={deleteOriginals}
                      onCheckedChange={(checked) => setDeleteOriginals(checked as boolean)}
                      disabled={isConverting}
                    />
                    <Label htmlFor="delete-originals" className="cursor-pointer">
                      Apagar imagens originais após conversão (somente da lista, não do seu dispositivo)
                    </Label>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Conversion Action */}
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleConvert}
                disabled={isConverting || images.length === 0}
                className="w-full md:w-auto min-w-[300px]"
              >
                {isConverting ? 'Convertendo...' : `Converter ${images.length} ${images.length === 1 ? 'Imagem' : 'Imagens'} para WebP`}
              </Button>
            </div>

            {/* Progress Section */}
            {isConverting && progress && (
              <ConversionProgressBar
                current={progress.current}
                total={progress.total}
                currentFileName={progress.currentFileName}
                percentage={progress.percentage}
              />
            )}

            {/* Conversion Log */}
            <ConversionLog logs={logs} />

            {/* Results Section */}
            {showResults && results.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Resultados da Conversão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-green-500/10 border-green-500/20">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                          <p className="text-2xl font-bold text-green-600">{successResults.length}</p>
                          <p className="text-sm text-muted-foreground">Convertidas com Sucesso</p>
                        </div>
                      </CardContent>
                    </Card>

                    {errorResults.length > 0 && (
                      <Card className="bg-destructive/10 border-destructive/20">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <XCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                            <p className="text-2xl font-bold text-destructive">{errorResults.length}</p>
                            <p className="text-sm text-muted-foreground">Erros</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card className="bg-green-500/10 border-green-500/20">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <TrendingDown className="h-8 w-8 mx-auto mb-2 text-green-600" />
                          <p className="text-2xl font-bold text-green-600">{formatBytes(totalSavedBytes)}</p>
                          <p className="text-sm text-muted-foreground">Espaço Economizado</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={downloadAll} disabled={successResults.length === 0}>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Todas ({successResults.length})
                    </Button>
                    <Button variant="outline" onClick={clearAll}>
                      Converter Novas Imagens
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

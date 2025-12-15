import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Check, Loader2 } from 'lucide-react';

interface ConversionTemplate {
  id: string;
  name: string;
  description: string | null;
  quality: number;
  target_width: number;
  target_height: number;
  apply_watermark: boolean;
  watermark_position: string | null;
  use_case: string | null;
  is_default: boolean;
  icon: string | null;
}

interface TemplateFormData {
  name: string;
  description: string;
  quality: number;
  target_width: number;
  target_height: number;
  apply_watermark: boolean;
  watermark_position: string;
  use_case: string;
  icon: string;
}

const ICONS = ['🖼️', '🎨', '🌟', '📱', '📸', '🏠', '🔲', '✨'];
const USE_CASES = [
  { value: 'thumbnail', label: 'Thumbnail' },
  { value: 'gallery', label: 'Galeria' },
  { value: 'hero', label: 'Hero Image' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'custom', label: 'Personalizado' },
];

const WATERMARK_POSITIONS = [
  { value: 'top-left', label: 'Superior Esquerdo' },
  { value: 'top-right', label: 'Superior Direito' },
  { value: 'bottom-left', label: 'Inferior Esquerdo' },
  { value: 'bottom-right', label: 'Inferior Direito' },
  { value: 'center', label: 'Centro' },
];

interface ConversionTemplatesProps {
  onSelectTemplate?: (template: ConversionTemplate) => void;
  selectedTemplateId?: string;
}

export function ConversionTemplates({ onSelectTemplate, selectedTemplateId }: ConversionTemplatesProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ConversionTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    quality: 85,
    target_width: 1200,
    target_height: 900,
    apply_watermark: false,
    watermark_position: 'bottom-right',
    use_case: 'custom',
    icon: '🖼️',
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['conversion-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversion_templates')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');
      
      if (error) throw error;
      return data as ConversionTemplate[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: TemplateFormData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from('conversion_templates')
          .update({
            name: data.name,
            description: data.description || null,
            quality: data.quality,
            target_width: data.target_width,
            target_height: data.target_height,
            apply_watermark: data.apply_watermark,
            watermark_position: data.watermark_position,
            use_case: data.use_case,
            icon: data.icon,
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('conversion_templates')
          .insert({
            name: data.name,
            description: data.description || null,
            quality: data.quality,
            target_width: data.target_width,
            target_height: data.target_height,
            apply_watermark: data.apply_watermark,
            watermark_position: data.watermark_position,
            use_case: data.use_case,
            icon: data.icon,
            is_default: false,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversion-templates'] });
      setIsDialogOpen(false);
      setEditingTemplate(null);
      resetForm();
      toast.success(editingTemplate ? 'Template atualizado!' : 'Template criado!');
    },
    onError: (error) => {
      console.error('Error saving template:', error);
      toast.error('Erro ao guardar template');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('conversion_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversion-templates'] });
      toast.success('Template eliminado!');
    },
    onError: () => {
      toast.error('Erro ao eliminar template');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      quality: 85,
      target_width: 1200,
      target_height: 900,
      apply_watermark: false,
      watermark_position: 'bottom-right',
      use_case: 'custom',
      icon: '🖼️',
    });
  };

  const handleEdit = (template: ConversionTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      quality: template.quality,
      target_width: template.target_width,
      target_height: template.target_height,
      apply_watermark: template.apply_watermark || false,
      watermark_position: template.watermark_position || 'bottom-right',
      use_case: template.use_case || 'custom',
      icon: template.icon || '🖼️',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ ...formData, id: editingTemplate?.id });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">🗂️ Templates de Conversão</h3>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingTemplate(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Editar Template' : 'Novo Template'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {ICONS.map((icon) => (
                  <Button
                    key={icon}
                    type="button"
                    variant={formData.icon === icon ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  >
                    {icon}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do template"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição opcional"
                />
              </div>

              <div className="space-y-2">
                <Label>Caso de Uso</Label>
                <Select
                  value={formData.use_case}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, use_case: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USE_CASES.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Qualidade</Label>
                  <span className="text-sm font-medium">{formData.quality}%</span>
                </div>
                <Slider
                  value={[formData.quality]}
                  onValueChange={([val]) => setFormData(prev => ({ ...prev, quality: val }))}
                  min={50}
                  max={100}
                  step={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Largura (px)</Label>
                  <Input
                    type="number"
                    value={formData.target_width}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_width: parseInt(e.target.value) || 0 }))}
                    min={100}
                    max={4000}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Altura (px)</Label>
                  <Input
                    type="number"
                    value={formData.target_height}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_height: parseInt(e.target.value) || 0 }))}
                    min={100}
                    max={4000}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Aplicar Marca d'Água</Label>
                <Switch
                  checked={formData.apply_watermark}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, apply_watermark: checked }))}
                />
              </div>

              {formData.apply_watermark && (
                <div className="space-y-2">
                  <Label>Posição da Marca d'Água</Label>
                  <Select
                    value={formData.watermark_position}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, watermark_position: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WATERMARK_POSITIONS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingTemplate ? 'Guardar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className={`relative cursor-pointer transition-all hover:shadow-md ${
              selectedTemplateId === template.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectTemplate?.(template)}
          >
            {selectedTemplateId === template.id && (
              <div className="absolute top-2 right-2">
                <Check className="h-5 w-5 text-primary" />
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{template.icon}</span>
                <div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  {template.is_default && (
                    <Badge variant="secondary" className="text-xs mt-1">Padrão</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {template.description || 'Sem descrição'}
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  {template.target_width}×{template.target_height}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {template.quality}%
                </Badge>
                {template.apply_watermark && (
                  <Badge variant="outline" className="text-xs">💧</Badge>
                )}
              </div>
              {!template.is_default && (
                <div className="flex gap-1 pt-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(template);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(template.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

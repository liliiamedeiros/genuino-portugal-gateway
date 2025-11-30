import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { convertToWebP, uploadImageToStorage } from '@/utils/imageUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X, AlertCircle, Languages, Tag } from 'lucide-react';
import { TagsInput } from '@/components/admin/TagsInput';
import { Checkbox } from '@/components/ui/checkbox';
import { generatePropertyJsonLd } from '@/utils/jsonLdUtils';
import type { WatermarkConfig } from '@/utils/watermarkUtils';
import { propertySchema } from '@/schemas/propertySchema';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [watermarkPosition, setWatermarkPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'>('bottom-right');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    title_fr: '',
    title_en: '',
    title_de: '',
    title_pt: '',
    description_fr: '',
    description_en: '',
    description_de: '',
    description_pt: '',
    location: '',
    region: '',
    city: '',
    address: '',
    postal_code: '',
    property_type: 'apartment',
    operation_type: 'sale',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area_sqm: '',
    parking_spaces: '',
    featured: false,
    status: 'active',
    map_embed_url: '',
    map_latitude: '',
    map_longitude: '',
    video_url: '',
    virtual_tour_url: '',
  });

  const [tags, setTags] = useState<string[]>([]);

  const [features, setFeatures] = useState({
    ar_condicionado: false,
    varanda: false,
    terraco: false,
    lugar_garagem: false,
    jardim: false,
    piscina: false,
    arrecadacao: false,
    casa_adaptada: false,
    ultimo_andar: false,
    andares_intermedios: false,
    res_do_chao: false,
    multimedia: false,
    com_planta: false,
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<Array<{ file: File; preview: string }>>([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const MAX_GALLERY_IMAGES = 10;

  const { data: existingProject } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error} = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  const { data: existingGallery } = useQuery({
    queryKey: ['project-gallery', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('project_images')
        .select('*')
        .eq('project_id', id)
        .order('order_index');
      
      if (error) throw error;
      return data || [];
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingProject) {
      setFormData({
        id: existingProject.id,
        title_fr: existingProject.title_fr,
        title_en: existingProject.title_en,
        title_de: existingProject.title_de,
        title_pt: existingProject.title_pt,
        description_fr: existingProject.description_fr,
        description_en: existingProject.description_en,
        description_de: existingProject.description_de,
        description_pt: existingProject.description_pt,
        location: existingProject.location,
        region: existingProject.region,
        city: existingProject.city || '',
        address: existingProject.address || '',
        postal_code: existingProject.postal_code || '',
        property_type: existingProject.property_type || 'apartment',
        operation_type: existingProject.operation_type || 'sale',
        price: existingProject.price?.toString() || '',
        bedrooms: existingProject.bedrooms?.toString() || '',
        bathrooms: existingProject.bathrooms?.toString() || '',
        area_sqm: existingProject.area_sqm?.toString() || '',
        parking_spaces: existingProject.parking_spaces?.toString() || '',
        featured: existingProject.featured || false,
        status: existingProject.status || 'active',
        map_embed_url: existingProject.map_embed_url || '',
        map_latitude: existingProject.map_latitude?.toString() || '',
        map_longitude: existingProject.map_longitude?.toString() || '',
        video_url: existingProject.video_url || '',
        virtual_tour_url: existingProject.virtual_tour_url || '',
      });

      if (existingProject.features && typeof existingProject.features === 'object') {
        const projectFeatures = existingProject.features as any;
        setFeatures({
          ar_condicionado: projectFeatures.ar_condicionado || false,
          varanda: projectFeatures.varanda || false,
          terraco: projectFeatures.terraco || false,
          lugar_garagem: projectFeatures.lugar_garagem || false,
          jardim: projectFeatures.jardim || false,
          piscina: projectFeatures.piscina || false,
          arrecadacao: projectFeatures.arrecadacao || false,
          casa_adaptada: projectFeatures.casa_adaptada || false,
          ultimo_andar: projectFeatures.ultimo_andar || false,
          andares_intermedios: projectFeatures.andares_intermedios || false,
          res_do_chao: projectFeatures.res_do_chao || false,
          multimedia: projectFeatures.multimedia || false,
          com_planta: projectFeatures.com_planta || false,
        });
      }

      if (existingProject.main_image) {
        setMainImagePreview(existingProject.main_image);
      }

      if (existingProject.tags && Array.isArray(existingProject.tags)) {
        setTags(existingProject.tags);
      }
    }
  }, [existingProject]);

  useEffect(() => {
    if (existingGallery && existingGallery.length > 0) {
      setExistingGalleryImages(existingGallery.map(img => img.image_url));
    }
  }, [existingGallery]);

  const checkForDuplicates = async (titlePt: string, address: string, postalCode: string): Promise<boolean> => {
    setCheckingDuplicate(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title_pt, address, postal_code')
        .or(`title_pt.ilike.${titlePt},and(address.ilike.${address || 'null'},postal_code.eq.${postalCode || 'null'})`)
        .neq('id', id || '');

      if (error) throw error;

      if (data && data.length > 0) {
        const duplicateReasons = [];
        if (data.some(p => p.title_pt.toLowerCase() === titlePt.toLowerCase())) {
          duplicateReasons.push('título em português');
        }
        if (address && postalCode && data.some(p => p.address?.toLowerCase() === address.toLowerCase() && p.postal_code === postalCode)) {
          duplicateReasons.push('endereço + código postal');
        }
        
        toast({
          title: "Imóvel duplicado detectado",
          description: `Já existe um imóvel com o mesmo ${duplicateReasons.join(' e ')}.`,
          variant: "destructive",
        });
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Erro ao verificar duplicados:', error);
      return false;
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const handleAutoTranslate = async () => {
    if (!formData.title_pt || !formData.description_pt) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e descrição em Português primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-property', {
        body: {
          title_pt: formData.title_pt,
          description_pt: formData.description_pt
        }
      });

      if (error) throw error;

      // Atualizar formData com traduções
      setFormData(prev => ({
        ...prev,
        title_fr: data.title_fr,
        title_en: data.title_en,
        title_de: data.title_de,
        description_fr: data.description_fr,
        description_en: data.description_en,
        description_de: data.description_de,
      }));

      toast({
        title: "✅ Tradução concluída",
        description: "Os textos foram traduzidos automaticamente para FR, EN e DE",
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Erro na tradução",
        description: "Não foi possível traduzir automaticamente. Preencha manualmente.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      setValidationErrors([]);

      let currentFormData = { ...formData };

      // Auto-translate if fields are empty
      const needsTranslation = !formData.title_fr || !formData.title_en || !formData.title_de;
      if (needsTranslation && formData.title_pt && formData.description_pt) {
        toast({
          title: "A traduzir automaticamente...",
          description: "Por favor aguarde",
        });
        
        try {
          const { data, error } = await supabase.functions.invoke('translate-property', {
            body: {
              title_pt: formData.title_pt,
              description_pt: formData.description_pt
            }
          });

          if (error) throw error;

          currentFormData = {
            ...currentFormData,
            title_fr: data.title_fr,
            title_en: data.title_en,
            title_de: data.title_de,
            description_fr: data.description_fr,
            description_en: data.description_en,
            description_de: data.description_de,
          };

          setFormData(currentFormData);
        } catch (error) {
          console.error('Translation error:', error);
          toast({
            title: "Erro na tradução",
            description: "Preencha manualmente os campos FR, EN e DE",
            variant: "destructive"
          });
          throw new Error('Translation failed');
        }
      }

      // Validação com Zod using the potentially translated data
      const validation = propertySchema.safeParse({
        ...currentFormData,
        featured: currentFormData.featured,
      });

      if (!validation.success) {
        const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        setValidationErrors(errors);
        throw new Error('Erros de validação');
      }

      // Verificar duplicados antes de criar/editar
      if (!isEdit) {
        const isDuplicate = await checkForDuplicates(
          currentFormData.title_pt,
          currentFormData.address,
          currentFormData.postal_code
        );
        if (isDuplicate) {
          throw new Error('Imóvel duplicado');
        }
      }

      const slug = generateSlug(currentFormData.title_pt);
      const projectId = isEdit ? currentFormData.id : `${slug}-${Date.now()}`;
      
      let mainImageUrl = existingProject?.main_image || null;

      if (mainImage) {
        const watermarkConfig: Partial<WatermarkConfig> = watermarkEnabled ? {
          position: watermarkPosition,
          opacity: 0.7,
        } : undefined;

        const webpBlob = await convertToWebP(mainImage, 1920, 1080, watermarkConfig);
        const uploadResult = await uploadImageToStorage(
          webpBlob,
          `properties/${projectId}/main-${Date.now()}.webp`,
          supabase
        );

        if (uploadResult.error) throw uploadResult.error;
        mainImageUrl = uploadResult.url;
      }

      const jsonLd = generatePropertyJsonLd({
        id: projectId,
        title_pt: currentFormData.title_pt,
        title_en: currentFormData.title_en,
        title_fr: currentFormData.title_fr,
        title_de: currentFormData.title_de,
        description_pt: currentFormData.description_pt,
        description_en: currentFormData.description_en,
        description_fr: currentFormData.description_fr,
        description_de: currentFormData.description_de,
        price: currentFormData.price ? parseFloat(currentFormData.price) : null,
        location: currentFormData.location,
        region: currentFormData.region,
        bedrooms: currentFormData.bedrooms ? parseInt(currentFormData.bedrooms) : null,
        bathrooms: currentFormData.bathrooms ? parseInt(currentFormData.bathrooms) : null,
        area_sqm: currentFormData.area_sqm ? parseFloat(currentFormData.area_sqm) : null,
        main_image: mainImageUrl,
        property_type: currentFormData.property_type,
        operation_type: currentFormData.operation_type,
      });

      const projectData = {
        id: projectId,
        title_fr: currentFormData.title_fr,
        title_en: currentFormData.title_en,
        title_de: currentFormData.title_de,
        title_pt: currentFormData.title_pt,
        description_fr: currentFormData.description_fr,
        description_en: currentFormData.description_en,
        description_de: currentFormData.description_de,
        description_pt: currentFormData.description_pt,
        location: currentFormData.location,
        region: currentFormData.region,
        city: currentFormData.city || null,
        address: currentFormData.address || null,
        postal_code: currentFormData.postal_code || null,
        property_type: currentFormData.property_type,
        operation_type: currentFormData.operation_type,
        price: currentFormData.price ? parseFloat(currentFormData.price) : null,
        bedrooms: currentFormData.bedrooms ? parseInt(currentFormData.bedrooms) : null,
        bathrooms: currentFormData.bathrooms ? parseInt(currentFormData.bathrooms) : null,
        area_sqm: currentFormData.area_sqm ? parseFloat(currentFormData.area_sqm) : null,
        parking_spaces: currentFormData.parking_spaces ? parseInt(currentFormData.parking_spaces) : null,
        featured: currentFormData.featured,
        status: currentFormData.status,
        main_image: mainImageUrl,
        json_ld: jsonLd,
        features: features,
        tags: tags,
        map_embed_url: currentFormData.map_embed_url || null,
        map_latitude: currentFormData.map_latitude ? parseFloat(currentFormData.map_latitude) : null,
        map_longitude: currentFormData.map_longitude ? parseFloat(currentFormData.map_longitude) : null,
        video_url: currentFormData.video_url || null,
        virtual_tour_url: currentFormData.virtual_tour_url || null,
      };

      const { error: projectError } = await supabase
        .from('projects')
        .upsert(projectData);

      if (projectError) throw projectError;

      // Upload gallery images
      if (galleryImages.length > 0) {
        for (let i = 0; i < galleryImages.length; i++) {
          const watermarkConfig: Partial<WatermarkConfig> = watermarkEnabled ? {
            position: watermarkPosition,
            opacity: 0.7,
          } : undefined;

          const webpBlob = await convertToWebP(galleryImages[i].file, 1920, 1080, watermarkConfig);
          const uploadResult = await uploadImageToStorage(
            webpBlob,
            `properties/${projectId}/gallery-${Date.now()}-${i}.webp`,
            supabase
          );

          if (uploadResult.error) throw uploadResult.error;

          const { error: galleryError } = await supabase
            .from('project_images')
            .insert({
              project_id: projectId,
              image_url: uploadResult.url!,
              order_index: existingGalleryImages.length + i,
            });

          if (galleryError) throw galleryError;
        }
      }

      return projectId;
    },
    onSuccess: (projectId) => {
      toast({
        title: isEdit ? "Imóvel atualizado" : "Imóvel criado",
        description: isEdit ? "As alterações foram guardadas com sucesso." : "O imóvel foi criado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/admin/properties');
    },
    onError: (error: any) => {
      console.error('Erro detalhado ao salvar imóvel:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      let errorMessage = 'Erro ao salvar o imóvel. Por favor, tente novamente.';
      
      if (error.message === 'Imóvel duplicado') {
        errorMessage = 'Este imóvel já existe no sistema.';
      } else if (error.message === 'Erros de validação') {
        errorMessage = 'Por favor, corrija os erros de validação.';
      } else if (error.code === '23505') {
        errorMessage = 'Já existe um imóvel com este identificador.';
      } else if (error.code === '42501') {
        errorMessage = 'Você não tem permissão para realizar esta operação. Entre em contato com um administrador.';
      } else if (error.details) {
        errorMessage = `Erro: ${error.details}`;
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "Ficheiro muito grande",
          description: "O tamanho máximo permitido é 20MB",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Ficheiro inválido",
          description: "Por favor selecione apenas ficheiros de imagem",
          variant: "destructive",
        });
        return;
      }

      setMainImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = MAX_GALLERY_IMAGES - (existingGalleryImages.length + galleryImages.length);
    
    if (files.length > remainingSlots) {
      toast({
        title: "Limite de imagens excedido",
        description: `Pode adicionar no máximo ${remainingSlots} imagens adicionais (limite total: ${MAX_GALLERY_IMAGES})`,
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "Ficheiro muito grande",
          description: `${file.name} excede 20MB`,
          variant: "destructive",
        });
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Ficheiro inválido",
          description: `${file.name} não é uma imagem`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    const newImages = validFiles.map(file => {
      const reader = new FileReader();
      return new Promise<{ file: File; preview: string }>((resolve) => {
        reader.onloadend = () => {
          resolve({ file, preview: reader.result as string });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newImages).then(images => {
      setGalleryImages(prev => [...prev, ...images]);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryImage = async (imageUrl: string) => {
    try {
      const imageRecord = existingGallery?.find(img => img.image_url === imageUrl);
      if (imageRecord) {
        const { error } = await supabase
          .from('project_images')
          .delete()
          .eq('id', imageRecord.id);

        if (error) throw error;

        setExistingGalleryImages(prev => prev.filter(url => url !== imageUrl));
        queryClient.invalidateQueries({ queryKey: ['project-gallery', id] });
        
        toast({
          title: "Imagem removida",
          description: "A imagem foi removida com sucesso",
        });
      }
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover a imagem",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title_pt || !formData.location || !formData.region) {
      toast({
        title: "Campos obrigatórios em falta",
        description: "Por favor preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      await saveMutation.mutateAsync();
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">
          {isEdit ? 'Editar Imóvel' : 'Adicionar Novo Imóvel'}
        </h1>

        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Informações Multilíngues</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoTranslate}
              disabled={isTranslating || !formData.title_pt || !formData.description_pt}
              className="gap-2"
            >
              <Languages className="h-4 w-4" />
              {isTranslating ? "A traduzir..." : "Traduzir Automaticamente"}
            </Button>
          </div>

          <Tabs defaultValue="pt" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pt">Português</TabsTrigger>
              <TabsTrigger value="fr">Français</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="de">Deutsch</TabsTrigger>
            </TabsList>

            <TabsContent value="pt" className="space-y-4">
              <div>
                <Label htmlFor="title_pt">Título (PT) *</Label>
                <Input
                  id="title_pt"
                  value={formData.title_pt}
                  onChange={(e) => setFormData({ ...formData, title_pt: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description_pt">Descrição (PT) *</Label>
                <Textarea
                  id="description_pt"
                  value={formData.description_pt}
                  onChange={(e) => setFormData({ ...formData, description_pt: e.target.value })}
                  rows={6}
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="fr" className="space-y-4">
              <div>
                <Label htmlFor="title_fr">Titre (FR) *</Label>
                <Input
                  id="title_fr"
                  value={formData.title_fr}
                  onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description_fr">Description (FR) *</Label>
                <Textarea
                  id="description_fr"
                  value={formData.description_fr}
                  onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                  rows={6}
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-4">
              <div>
                <Label htmlFor="title_en">Title (EN) *</Label>
                <Input
                  id="title_en"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description_en">Description (EN) *</Label>
                <Textarea
                  id="description_en"
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={6}
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="de" className="space-y-4">
              <div>
                <Label htmlFor="title_de">Titel (DE) *</Label>
                <Input
                  id="title_de"
                  value={formData.title_de}
                  onChange={(e) => setFormData({ ...formData, title_de: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description_de">Beschreibung (DE) *</Label>
                <Textarea
                  id="description_de"
                  value={formData.description_de}
                  onChange={(e) => setFormData({ ...formData, description_de: e.target.value })}
                  rows={6}
                  required
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Localização *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="region">Região *</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="postal_code">Código Postal</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="property_type">Tipo de Imóvel</Label>
              <Select
                value={formData.property_type}
                onValueChange={(value) => setFormData({ ...formData, property_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                  <SelectItem value="house">Moradia</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="land">Terreno</SelectItem>
                  <SelectItem value="commercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="operation_type">Tipo de Operação</Label>
              <Select
                value={formData.operation_type}
                onValueChange={(value) => setFormData({ ...formData, operation_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Venda</SelectItem>
                  <SelectItem value="rent">Arrendamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Preço (€)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="area_sqm">Área (m²)</Label>
              <Input
                id="area_sqm"
                type="number"
                value={formData.area_sqm}
                onChange={(e) => setFormData({ ...formData, area_sqm: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bedrooms">Quartos</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bathrooms">Casas de Banho</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="parking_spaces">Lugares de Garagem</Label>
              <Input
                id="parking_spaces"
                type="number"
                value={formData.parking_spaces}
                onChange={(e) => setFormData({ ...formData, parking_spaces: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label className="text-lg font-semibold mb-3 block">Características do Imóvel</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries({
                ar_condicionado: 'Ar Condicionado',
                varanda: 'Varanda',
                terraco: 'Terraço',
                lugar_garagem: 'Lugar de Garagem',
                jardim: 'Jardim',
                piscina: 'Piscina',
                arrecadacao: 'Arrecadação',
                casa_adaptada: 'Casa Adaptada',
                ultimo_andar: 'Último Andar',
                andares_intermedios: 'Andares Intermédios',
                res_do_chao: 'Rés do Chão',
                multimedia: 'Multimédia',
                com_planta: 'Com Planta',
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={features[key as keyof typeof features]}
                    onCheckedChange={(checked) => 
                      setFeatures({ ...features, [key]: checked === true })
                    }
                  />
                  <Label htmlFor={key} className="cursor-pointer">{label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              <Label className="text-lg font-semibold">Tags / Categorias</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Adicione tags para facilitar a pesquisa (ex: piscina, garagem, vista-mar, etc.)
            </p>
            <TagsInput
              value={tags}
              onChange={setTags}
              suggestions={[
                'piscina', 'garagem', 'vista-mar', 'jardim', 'terraço', 
                'ar-condicionado', 'varanda', 'arrecadação', 'elevador',
                'condomínio-fechado', 'mobilado', 'recente', 'renovado',
                'praia', 'campo', 'cidade', 'montanha', 'luxo'
              ]}
              placeholder="Digite uma tag e pressione Enter"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-semibold">Mapa do Imóvel</Label>
            <div>
              <Label htmlFor="map_embed_url">URL de Incorporação do Mapa (iframe do Google Maps)</Label>
              <Input
                id="map_embed_url"
                type="url"
                placeholder="https://www.google.com/maps/embed?pb=..."
                value={formData.map_embed_url}
                onChange={(e) => setFormData({ ...formData, map_embed_url: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Cole o URL de incorporação do Google Maps (iframe src)
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="map_latitude">Latitude</Label>
                <Input
                  id="map_latitude"
                  type="number"
                  step="any"
                  placeholder="41.1579"
                  value={formData.map_latitude}
                  onChange={(e) => setFormData({ ...formData, map_latitude: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="map_longitude">Longitude</Label>
                <Input
                  id="map_longitude"
                  type="number"
                  step="any"
                  placeholder="-8.6291"
                  value={formData.map_longitude}
                  onChange={(e) => setFormData({ ...formData, map_longitude: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-semibold">Multimédia</Label>
            <div>
              <Label htmlFor="video_url">URL do Vídeo (YouTube, Vimeo, etc.)</Label>
              <Input
                id="video_url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Cole o URL do vídeo do imóvel (YouTube, Vimeo, etc.)
              </p>
            </div>
            <div>
              <Label htmlFor="virtual_tour_url">URL do Tour Virtual 360°</Label>
              <Input
                id="virtual_tour_url"
                type="url"
                placeholder="https://my.matterport.com/..."
                value={formData.virtual_tour_url}
                onChange={(e) => setFormData({ ...formData, virtual_tour_url: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Cole o URL do tour virtual 360° (Matterport, Kuula, etc.)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="watermark"
                  checked={watermarkEnabled}
                  onCheckedChange={(checked) => setWatermarkEnabled(checked === true)}
                />
                <Label htmlFor="watermark">Adicionar marca d'água</Label>
              </div>
              
              {watermarkEnabled && (
                <Select
                  value={watermarkPosition}
                  onValueChange={(value: any) => setWatermarkPosition(value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Inferior Direita</SelectItem>
                    <SelectItem value="bottom-left">Inferior Esquerda</SelectItem>
                    <SelectItem value="top-right">Superior Direita</SelectItem>
                    <SelectItem value="top-left">Superior Esquerda</SelectItem>
                    <SelectItem value="center">Centro</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label htmlFor="main_image">Imagem Principal</Label>
              <div className="mt-2">
                <label htmlFor="main_image" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    {mainImagePreview ? (
                      <div className="relative">
                        <img
                          src={mainImagePreview}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={(e) => {
                            e.preventDefault();
                            setMainImage(null);
                            setMainImagePreview('');
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p>Clique para selecionar uma imagem</p>
                        <p className="text-sm text-gray-500">PNG, JPG até 20MB</p>
                      </div>
                    )}
                  </div>
                </label>
                <input
                  id="main_image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleMainImageChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="gallery_images">
                Galeria de Imagens ({existingGalleryImages.length + galleryImages.length}/{MAX_GALLERY_IMAGES})
              </Label>
              <div className="mt-2">
                <label htmlFor="gallery_images" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p>Clique para adicionar imagens à galeria</p>
                    <p className="text-sm text-gray-500">
                      Pode adicionar até {MAX_GALLERY_IMAGES - existingGalleryImages.length - galleryImages.length} imagens
                    </p>
                  </div>
                </label>
                <input
                  id="gallery_images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleGalleryImagesChange}
                  disabled={existingGalleryImages.length + galleryImages.length >= MAX_GALLERY_IMAGES}
                />
              </div>

              {(existingGalleryImages.length > 0 || galleryImages.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {existingGalleryImages.map((imageUrl, index) => (
                    <div key={`existing-${index}`} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeExistingGalleryImage(imageUrl)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {galleryImages.map((image, index) => (
                    <div key={`new-${index}`} className="relative">
                      <img
                        src={image.preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeGalleryImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked === true })}
              />
              <Label htmlFor="featured">Destacar no site</Label>
            </div>

            <div>
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="sold">Vendido</SelectItem>
                  <SelectItem value="rented">Arrendado</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={uploading || checkingDuplicate}
              className="flex-1"
            >
              {uploading ? 'A guardar...' : checkingDuplicate ? 'A verificar...' : isEdit ? 'Atualizar Imóvel' : 'Criar Imóvel'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/properties')}
              disabled={uploading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

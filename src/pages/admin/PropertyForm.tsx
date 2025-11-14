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
import { Upload, X, MapPin } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { generatePropertyJsonLd } from '@/utils/jsonLdUtils';
import type { WatermarkConfig } from '@/utils/watermarkUtils';

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  // Helper function to generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [watermarkPosition, setWatermarkPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'>('bottom-right');

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
  });

  const [features, setFeatures] = useState({
    air_conditioning: false,
    balcony: false,
    terrace: false,
    garage: false,
    garden: false,
    pool: false,
    storage: false,
    adapted: false,
    top_floor: false,
    middle_floors: false,
    ground_floor: false,
    multimedia: false,
    floor_plan: false,
  });

  const [mapData, setMapData] = useState({
    latitude: '',
    longitude: '',
    embedUrl: '',
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
      const { data, error } = await supabase
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
      });
      if (existingProject.main_image) {
        setMainImagePreview(existingProject.main_image);
      }
      
      // Load features if they exist
      if (existingProject.features && typeof existingProject.features === 'object') {
        setFeatures({ ...features, ...(existingProject.features as Record<string, boolean>) });
      }
      
      // Load map data if exists
      if (existingProject.map_latitude) {
        setMapData({
          latitude: existingProject.map_latitude?.toString() || '',
          longitude: existingProject.map_longitude?.toString() || '',
          embedUrl: existingProject.map_embed_url || '',
        });
      }
    }
  }, [existingProject]);

  useEffect(() => {
    if (existingGallery && existingGallery.length > 0) {
      setExistingGalleryImages(existingGallery.map(img => img.image_url));
    }
  }, [existingGallery]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      let mainImageUrl = mainImagePreview;

      // Upload main image if provided
      if (mainImage) {
        try {
          setUploading(true);
          const watermarkConfig: Partial<WatermarkConfig> = watermarkEnabled ? {
            enabled: true,
            position: watermarkPosition,
            text: '© Capital Estate Group',
            opacity: 0.7
          } : { enabled: false };
          
          const webpBlob = await convertToWebP(mainImage, 800, 600, watermarkConfig);
          const timestamp = Date.now();
          const projectId = formData.id || `${generateSlug(formData.title_pt)}-${timestamp}`;
          const path = `${projectId}/main-${timestamp}.webp`;
          
          const { url, error } = await uploadImageToStorage(webpBlob, path, supabase);
          
          if (error) {
            console.error('Image upload error:', error);
            throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
          }
          
          mainImageUrl = url || '';
        } catch (error: any) {
          setUploading(false);
          throw new Error(error.message || 'Erro ao fazer upload da imagem');
        }
      }

      // Generate unique ID with better collision prevention
      const generateUniqueId = () => {
        const randomString = Math.random().toString(36).substring(2, 9);
        const timestamp = Date.now();
        const slug = formData.title_pt 
          ? generateSlug(formData.title_pt).substring(0, 30)
          : 'property';
        return `${slug}-${timestamp}-${randomString}`;
      };

      let projectId = formData.id || generateUniqueId();
      
      // Validate ID doesn't exist (for new projects)
      if (!isEdit) {
        const { data: existing } = await supabase
          .from('projects')
          .select('id')
          .eq('id', projectId)
          .maybeSingle();
        
        if (existing) {
          projectId = generateUniqueId();
        }
      }

      // Generate JSON-LD for SEO
      const jsonLd = generatePropertyJsonLd({
        id: projectId,
        title_pt: formData.title_pt,
        title_en: formData.title_en,
        title_fr: formData.title_fr,
        title_de: formData.title_de,
        description_pt: formData.description_pt,
        description_en: formData.description_en,
        description_fr: formData.description_fr,
        description_de: formData.description_de,
        price: formData.price ? parseFloat(formData.price) : 0,
        property_type: formData.property_type,
        operation_type: formData.operation_type,
        location: formData.location,
        city: formData.city,
        region: formData.region,
        address: formData.address,
        postal_code: formData.postal_code,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : undefined,
        main_image: mainImageUrl
      });

      const projectData = {
        id: projectId,
        title_fr: formData.title_fr,
        title_en: formData.title_en,
        title_de: formData.title_de,
        title_pt: formData.title_pt,
        description_fr: formData.description_fr,
        description_en: formData.description_en,
        description_de: formData.description_de,
        description_pt: formData.description_pt,
        location: formData.location,
        region: formData.region,
        city: formData.city,
        address: formData.address,
        postal_code: formData.postal_code,
        property_type: formData.property_type,
        operation_type: formData.operation_type,
        price: formData.price ? parseFloat(formData.price) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,
        json_ld: jsonLd,
        parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : null,
        featured: formData.featured,
        main_image: mainImageUrl,
        status: formData.status,
        features: features,
        map_latitude: mapData.latitude ? parseFloat(mapData.latitude) : null,
        map_longitude: mapData.longitude ? parseFloat(mapData.longitude) : null,
        map_embed_url: mapData.embedUrl || null,
      };

      if (isEdit) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);
        
        if (error) throw error;
      }

      // Upload gallery images
      console.log('🖼️ Starting gallery upload. Total images:', galleryImages.length);
      console.log('📊 Project ID:', projectId);
      console.log('📋 Existing gallery images:', existingGalleryImages.length);
      
      if (galleryImages.length > 0) {
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < galleryImages.length; i++) {
          const { file } = galleryImages[i];
          console.log(`\n🔄 Processing image ${i + 1}/${galleryImages.length}:`, file.name);
          
          try {
            const watermarkConfig: Partial<WatermarkConfig> = watermarkEnabled ? {
              enabled: true,
              position: watermarkPosition,
              text: '© Capital Estate Group',
              opacity: 0.7
            } : { enabled: false };
            
            console.log('⚙️ Converting to WebP with watermark:', watermarkEnabled);
            const webpBlob = await convertToWebP(file, 800, 600, watermarkConfig);
            const timestamp = Date.now();
            const path = `${projectId}/gallery-${timestamp}-${i}.webp`;
            
            console.log('☁️ Uploading to storage:', path);
            const { url, error } = await uploadImageToStorage(webpBlob, path, supabase);
            
            if (error) {
              console.error('❌ Upload error:', error);
              errorCount++;
              continue;
            }

            console.log('✅ Upload successful. URL:', url);

            if (url) {
              const insertData = {
                project_id: projectId,
                image_url: url,
                order_index: existingGalleryImages.length + i,
              };
              console.log('💾 Inserting into project_images:', insertData);
              
              const { data: insertedData, error: insertError } = await supabase
                .from('project_images')
                .insert(insertData)
                .select();
              
              if (insertError) {
                console.error('❌ Insert error:', insertError);
                console.error('Insert error code:', insertError.code);
                console.error('Insert error details:', insertError.details);
                console.error('Insert error hint:', insertError.hint);
                errorCount++;
              } else {
                console.log('✅ Insert successful:', insertedData);
                successCount++;
              }
            } else {
              console.warn('⚠️ No URL returned from upload');
              errorCount++;
            }
          } catch (error) {
            console.error('❌ Gallery image upload error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            errorCount++;
          }
        }
        
        console.log(`\n📈 Upload summary: ${successCount} success, ${errorCount} errors`);
        
        // Feedback ao usuário
        if (successCount > 0) {
          toast({
            title: `${successCount} foto(s) adicionada(s)`,
            description: errorCount > 0 ? `${errorCount} foto(s) falharam` : 'Galeria atualizada com sucesso',
          });
        }
        
        if (errorCount > 0 && successCount === 0) {
          toast({
            title: 'Erro ao adicionar fotos',
            description: `${errorCount} foto(s) não foram carregadas. Verifique o console para mais detalhes.`,
            variant: 'destructive',
          });
        }
      } else {
        console.log('ℹ️ No gallery images to upload');
      }

      setUploading(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast({
        title: isEdit ? 'Imóvel atualizado' : 'Imóvel criado',
        description: isEdit 
          ? 'O imóvel foi atualizado com sucesso' 
          : 'O imóvel foi criado com sucesso',
      });
      navigate('/admin/properties');
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao salvar o imóvel',
        variant: 'destructive',
      });
    },
  });

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: 'Imagem muito grande',
          description: 'O tamanho máximo da imagem é 20MB',
          variant: 'destructive',
        });
        return;
      }

      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        toast({
          title: 'Formato inválido',
          description: 'Use apenas JPEG, PNG ou WebP',
          variant: 'destructive',
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
    const totalImages = existingGalleryImages.length + galleryImages.length + files.length;

    if (totalImages > MAX_GALLERY_IMAGES) {
      toast({
        title: 'Limite excedido',
        description: `Máximo de ${MAX_GALLERY_IMAGES} fotos permitidas na galeria`,
        variant: 'destructive',
      });
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: 'Imagem muito grande',
          description: `${file.name} excede 20MB`,
          variant: 'destructive',
        });
        return false;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        toast({
          title: 'Formato inválido',
          description: `${file.name} não é um formato válido`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setGalleryImages([...galleryImages, ...newImages]);
  };

  const removeGalleryImage = (index: number) => {
    const newImages = [...galleryImages];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setGalleryImages(newImages);
  };

  const removeExistingGalleryImage = async (imageUrl: string) => {
    try {
      // Delete from database
      await supabase
        .from('project_images')
        .delete()
        .eq('project_id', id)
        .eq('image_url', imageUrl);

      setExistingGalleryImages(existingGalleryImages.filter(img => img !== imageUrl));
      
      toast({
        title: 'Imagem removida',
        description: 'A imagem foi removida da galeria',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a imagem',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title_pt || !formData.description_pt || !formData.location || !formData.region) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    if (!mainImagePreview && !isEdit) {
      toast({
        title: 'Imagem obrigatória',
        description: 'Adicione uma imagem principal para o imóvel',
        variant: 'destructive',
      });
      return;
    }

    saveMutation.mutate();
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            {isEdit ? 'Editar Imóvel' : 'Novo Imóvel'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isEdit ? 'Atualize as informações do imóvel' : 'Adicione um novo imóvel ao sistema'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ID do projeto */}
            {!isEdit && (
              <div>
                <Label htmlFor="id">ID do Projeto (opcional)</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.trim() })}
                  placeholder="Deixe vazio para gerar automaticamente"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Se não preencher, será gerado automaticamente baseado no título em português
                </p>
              </div>
            )}

            {/* Títulos multilíngues */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Títulos (Multilíngue)</h3>
              <Tabs defaultValue="pt" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="pt">Português</TabsTrigger>
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="de">Deutsch</TabsTrigger>
                </TabsList>
                <TabsContent value="pt" className="space-y-4">
                  <div>
                    <Label htmlFor="title_pt">Título (Português) *</Label>
                    <Input
                      id="title_pt"
                      value={formData.title_pt}
                      onChange={(e) => setFormData({ ...formData, title_pt: e.target.value })}
                      required
                    />
                  </div>
                </TabsContent>
                <TabsContent value="fr" className="space-y-4">
                  <div>
                    <Label htmlFor="title_fr">Titre (Français) *</Label>
                    <Input
                      id="title_fr"
                      value={formData.title_fr}
                      onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                      required
                    />
                  </div>
                </TabsContent>
                <TabsContent value="en" className="space-y-4">
                  <div>
                    <Label htmlFor="title_en">Title (English) *</Label>
                    <Input
                      id="title_en"
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      required
                    />
                  </div>
                </TabsContent>
                <TabsContent value="de" className="space-y-4">
                  <div>
                    <Label htmlFor="title_de">Titel (Deutsch) *</Label>
                    <Input
                      id="title_de"
                      value={formData.title_de}
                      onChange={(e) => setFormData({ ...formData, title_de: e.target.value })}
                      required
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Descrições multilíngues */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Descrições (Multilíngue)</h3>
              <Tabs defaultValue="pt" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="pt">Português</TabsTrigger>
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="de">Deutsch</TabsTrigger>
                </TabsList>
                <TabsContent value="pt" className="space-y-4">
                  <div>
                    <Label htmlFor="description_pt">Descrição (Português) *</Label>
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
                    <Label htmlFor="description_fr">Description (Français) *</Label>
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
                    <Label htmlFor="description_en">Description (English) *</Label>
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
                    <Label htmlFor="description_de">Beschreibung (Deutsch) *</Label>
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
            </div>

            {/* Localização */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Localização</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Localização *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: Lisboa"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="region">Região *</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="Ex: Lisboa"
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
                    placeholder="1000-000"
                  />
                </div>
              </div>
            </div>

            {/* Tipo e Preço */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Tipo e Preço</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div>
                  <Label htmlFor="price">Preço (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="250000"
                  />
                </div>
              </div>
            </div>

            {/* Características */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Características</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <Label htmlFor="area_sqm">Área (m²)</Label>
                  <Input
                    id="area_sqm"
                    type="number"
                    value={formData.area_sqm}
                    onChange={(e) => setFormData({ ...formData, area_sqm: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="parking_spaces">Estacionamento</Label>
                  <Input
                    id="parking_spaces"
                    type="number"
                    value={formData.parking_spaces}
                    onChange={(e) => setFormData({ ...formData, parking_spaces: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="featured">Destacar este imóvel na página inicial</Label>
              </div>
            </div>

            {/* Imagem Principal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Imagem Principal *</h3>
              <div className="space-y-4">
                {mainImagePreview && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                    <img
                      src={mainImagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setMainImage(null);
                        setMainImagePreview('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div>
                  <Label htmlFor="main_image" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Clique para selecionar uma imagem
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        A imagem será automaticamente convertida para WebP
                      </p>
                    </div>
                  </Label>
                  <Input
                    id="main_image"
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Galeria de Fotos */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Galeria de Fotos (Máximo {MAX_GALLERY_IMAGES})
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {existingGalleryImages.length + galleryImages.length} / {MAX_GALLERY_IMAGES} fotos
              </p>
              
              {/* Existing Gallery Images */}
              {existingGalleryImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Fotos Existentes:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingGalleryImages.map((imageUrl, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border group">
                        <img
                          src={imageUrl}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeExistingGalleryImage(imageUrl)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Gallery Images */}
              {galleryImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Novas Fotos:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {galleryImages.map((image, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border group">
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeGalleryImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              {(existingGalleryImages.length + galleryImages.length) < MAX_GALLERY_IMAGES && (
                <div>
                  <Label htmlFor="gallery_images" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Adicionar fotos à galeria ({MAX_GALLERY_IMAGES - existingGalleryImages.length - galleryImages.length} restantes)
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Selecione múltiplas fotos (máximo 20MB cada)
                      </p>
                    </div>
                  </Label>
                  <Input
                    id="gallery_images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImagesChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Características do Imóvel */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Características</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: 'air_conditioning', label: 'Ar Condicionado', icon: '❄️' },
                  { key: 'balcony', label: 'Varanda', icon: '🏡' },
                  { key: 'terrace', label: 'Terraço', icon: '🌅' },
                  { key: 'garage', label: 'Lugar de Garagem', icon: '🚗' },
                  { key: 'garden', label: 'Jardim', icon: '🌳' },
                  { key: 'pool', label: 'Piscina', icon: '🏊' },
                  { key: 'storage', label: 'Arrecadação', icon: '📦' },
                  { key: 'adapted', label: 'Casa Adaptada', icon: '♿' },
                  { key: 'top_floor', label: 'Último Andar', icon: '🔝' },
                  { key: 'middle_floors', label: 'Andares Intermédios', icon: '🏢' },
                  { key: 'ground_floor', label: 'Rés do Chão', icon: '⬇️' },
                  { key: 'multimedia', label: 'Multimédia', icon: '📺' },
                  { key: 'floor_plan', label: 'Com Planta', icon: '📐' },
                ].map(({ key, label, icon }) => (
                  <div key={key} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <Checkbox
                      id={key}
                      checked={features[key as keyof typeof features]}
                      onCheckedChange={(checked) => 
                        setFeatures({ ...features, [key]: checked })
                      }
                    />
                    <Label htmlFor={key} className="cursor-pointer flex items-center gap-2 flex-1">
                      <span className="text-xl">{icon}</span>
                      <span className="text-sm">{label}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Localização no Mapa */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Localização no Mapa
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="text"
                    placeholder="38.7223"
                    value={mapData.latitude}
                    onChange={(e) => setMapData({ ...mapData, latitude: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Exemplo: 38.7223
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="text"
                    placeholder="-9.1393"
                    value={mapData.longitude}
                    onChange={(e) => setMapData({ ...mapData, longitude: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Exemplo: -9.1393
                  </p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="mapEmbed">URL do Mapa Incorporado (Google Maps)</Label>
                <Input
                  id="mapEmbed"
                  type="url"
                  placeholder="https://www.google.com/maps/embed?..."
                  value={mapData.embedUrl}
                  onChange={(e) => setMapData({ ...mapData, embedUrl: e.target.value })}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Cole o URL do iframe de incorporação do Google Maps
                </p>
              </div>
              
              {/* Preview do Mapa */}
              {mapData.embedUrl && (
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    src={mapData.embedUrl}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Map Preview"
                  />
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/properties')}
                disabled={saveMutation.isPending || uploading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saveMutation.isPending || uploading}>
                {saveMutation.isPending || uploading
                  ? 'Salvando...'
                  : isEdit
                  ? 'Atualizar Imóvel'
                  : 'Criar Imóvel'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

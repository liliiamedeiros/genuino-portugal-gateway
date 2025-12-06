import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Trash2, Plus, GripVertical, Languages } from 'lucide-react';
import { TagsInput } from '@/components/admin/TagsInput';
import { ImageDropzone } from '@/components/admin/ImageDropzone';

const portfolioSchema = z.object({
  title_pt: z.string().min(3, 'Título em português é obrigatório (mínimo 3 caracteres)'),
  title_fr: z.string().optional().or(z.literal('')),
  title_en: z.string().optional().or(z.literal('')),
  title_de: z.string().optional().or(z.literal('')),
  description_pt: z.string().min(10, 'Descrição em português é obrigatória (mínimo 10 caracteres)'),
  description_fr: z.string().optional().or(z.literal('')),
  description_en: z.string().optional().or(z.literal('')),
  description_de: z.string().optional().or(z.literal('')),
  location: z.string().min(1, 'Localização é obrigatória'),
  region: z.string().min(1, 'Região é obrigatória'),
  city: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  postal_code: z.string().optional().or(z.literal('')),
  property_type: z.string().optional(),
  operation_type: z.string().optional(),
  price: z.coerce.number().optional(),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  area_sqm: z.coerce.number().optional(),
  parking_spaces: z.coerce.number().optional(),
  video_url: z.string().optional().or(z.literal('')),
  virtual_tour_url: z.string().optional().or(z.literal('')),
  map_embed_url: z.string().optional().or(z.literal('')),
  status: z.string().default('active'),
  featured: z.boolean().default(false),
});

type PortfolioFormData = z.infer<typeof portfolioSchema>;

interface GalleryImage {
  id?: string;
  image_url: string;
  order_index: number;
  file?: File;
  isNew?: boolean;
}

export default function PortfolioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);
  
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  const form = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      title_pt: '',
      title_fr: '',
      title_en: '',
      title_de: '',
      description_pt: '',
      description_fr: '',
      description_en: '',
      description_de: '',
      location: '',
      region: '',
      city: '',
      address: '',
      postal_code: '',
      property_type: 'house',
      operation_type: 'sale',
      price: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      area_sqm: undefined,
      parking_spaces: undefined,
      video_url: '',
      virtual_tour_url: '',
      map_embed_url: '',
      status: 'active',
      featured: false,
    }
  });

  // Fetch existing project for editing
  const { data: existingProject, isLoading: projectLoading } = useQuery({
    queryKey: ['portfolio-project', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: isEditing
  });

  // Fetch gallery images
  const { data: existingImages } = useQuery({
    queryKey: ['portfolio-images', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('portfolio_id', id)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isEditing
  });

  // Populate form with existing data
  useEffect(() => {
    if (existingProject) {
      form.reset({
        title_pt: existingProject.title_pt || '',
        title_fr: existingProject.title_fr || '',
        title_en: existingProject.title_en || '',
        title_de: existingProject.title_de || '',
        description_pt: existingProject.description_pt || '',
        description_fr: existingProject.description_fr || '',
        description_en: existingProject.description_en || '',
        description_de: existingProject.description_de || '',
        location: existingProject.location || '',
        region: existingProject.region || '',
        city: existingProject.city || '',
        address: existingProject.address || '',
        postal_code: existingProject.postal_code || '',
        property_type: existingProject.property_type || 'house',
        operation_type: existingProject.operation_type || 'sale',
        price: existingProject.price || undefined,
        bedrooms: existingProject.bedrooms || undefined,
        bathrooms: existingProject.bathrooms || undefined,
        area_sqm: existingProject.area_sqm || undefined,
        parking_spaces: existingProject.parking_spaces || undefined,
        video_url: existingProject.video_url || '',
        virtual_tour_url: existingProject.virtual_tour_url || '',
        map_embed_url: existingProject.map_embed_url || '',
        status: existingProject.status || 'active',
        featured: existingProject.featured || false,
      });
      
      if (existingProject.main_image) {
        setMainImagePreview(existingProject.main_image);
      }
      
      if (existingProject.tags) {
        setTags(existingProject.tags);
      }
      
      if (existingProject.features) {
        setFeatures(existingProject.features as Record<string, boolean>);
      }
    }
  }, [existingProject, form]);

  // Populate gallery images
  useEffect(() => {
    if (existingImages) {
      setGalleryImages(existingImages.map(img => ({
        id: img.id,
        image_url: img.image_url,
        order_index: img.order_index,
      })));
    }
  }, [existingImages]);

  // Upload image to storage
  const uploadImage = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('project-images')
      .upload(fileName, file, { upsert: true });
    
    if (error) throw error;
    
    const { data: publicUrl } = supabase.storage
      .from('project-images')
      .getPublicUrl(data.path);
    
    return publicUrl.publicUrl;
  };

  // Auto-translate
  const handleAutoTranslate = async () => {
    const titlePt = form.getValues('title_pt');
    const descriptionPt = form.getValues('description_pt');
    
    if (!titlePt || !descriptionPt) {
      toast({ title: 'Preencha primeiro o título e descrição em português', variant: 'destructive' });
      return;
    }
    
    setIsTranslating(true);
    try {
      const response = await supabase.functions.invoke('translate-property', {
        body: { title: titlePt, description: descriptionPt }
      });
      
      if (response.data) {
        form.setValue('title_fr', response.data.title_fr || titlePt);
        form.setValue('title_en', response.data.title_en || titlePt);
        form.setValue('title_de', response.data.title_de || titlePt);
        form.setValue('description_fr', response.data.description_fr || descriptionPt);
        form.setValue('description_en', response.data.description_en || descriptionPt);
        form.setValue('description_de', response.data.description_de || descriptionPt);
        toast({ title: 'Tradução automática concluída!' });
      }
    } catch (error) {
      // Fallback to Portuguese text
      form.setValue('title_fr', titlePt);
      form.setValue('title_en', titlePt);
      form.setValue('title_de', titlePt);
      form.setValue('description_fr', descriptionPt);
      form.setValue('description_en', descriptionPt);
      form.setValue('description_de', descriptionPt);
      toast({ title: 'Tradução usou texto em português como fallback', variant: 'destructive' });
    } finally {
      setIsTranslating(false);
    }
  };

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (formData: PortfolioFormData) => {
      let mainImageUrl = mainImagePreview;
      
      if (mainImage) {
        mainImageUrl = await uploadImage(mainImage, 'portfolio');
      }
      
      const projectData = {
        title_pt: formData.title_pt,
        title_fr: formData.title_fr || formData.title_pt,
        title_en: formData.title_en || formData.title_pt,
        title_de: formData.title_de || formData.title_pt,
        description_pt: formData.description_pt,
        description_fr: formData.description_fr || formData.description_pt,
        description_en: formData.description_en || formData.description_pt,
        description_de: formData.description_de || formData.description_pt,
        location: formData.location,
        region: formData.region,
        city: formData.city || null,
        address: formData.address || null,
        postal_code: formData.postal_code || null,
        property_type: formData.property_type || null,
        operation_type: formData.operation_type || null,
        price: formData.price || null,
        bedrooms: formData.bedrooms || null,
        bathrooms: formData.bathrooms || null,
        area_sqm: formData.area_sqm || null,
        parking_spaces: formData.parking_spaces || null,
        video_url: formData.video_url || null,
        virtual_tour_url: formData.virtual_tour_url || null,
        map_embed_url: formData.map_embed_url || null,
        status: formData.status,
        featured: formData.featured,
        main_image: mainImageUrl || null,
        tags,
        features,
      };
      
      let projectId: string;
      
      if (isEditing && id) {
        const { error } = await supabase
          .from('portfolio_projects')
          .update(projectData)
          .eq('id', id);
        
        if (error) throw error;
        projectId = id;
      } else {
        const { data, error } = await supabase
          .from('portfolio_projects')
          .insert([projectData])
          .select('id')
          .single();
        
        if (error) throw error;
        projectId = data.id;
      }
      
      // Handle gallery images
      const newImages = galleryImages.filter(img => img.isNew && img.file);
      for (const img of newImages) {
        if (img.file) {
          const imageUrl = await uploadImage(img.file, `portfolio/${projectId}`);
          await supabase.from('portfolio_images').insert({
            portfolio_id: projectId,
            image_url: imageUrl,
            order_index: img.order_index,
          });
        }
      }
      
      return projectId;
    },
    onSuccess: () => {
      toast({ title: isEditing ? 'Projeto atualizado com sucesso!' : 'Projeto criado com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-projects'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-projects'] });
      navigate('/admin/portfolio');
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao guardar', description: error.message, variant: 'destructive' });
    }
  });

  // Handle main image selection
  const handleMainImageSelect = (files: File[]) => {
    if (files.length > 0) {
      setMainImage(files[0]);
      setMainImagePreview(URL.createObjectURL(files[0]));
    }
  };

  // Handle gallery images selection
  const handleGalleryImagesSelect = (files: File[]) => {
    const newImages: GalleryImage[] = files.map((file, index) => ({
      image_url: URL.createObjectURL(file),
      order_index: galleryImages.length + index,
      file,
      isNew: true,
    }));
    setGalleryImages(prev => [...prev, ...newImages]);
  };

  // Remove gallery image
  const removeGalleryImage = async (index: number) => {
    const image = galleryImages[index];
    if (image.id) {
      await supabase.from('portfolio_images').delete().eq('id', image.id);
    }
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: PortfolioFormData) => {
    submitMutation.mutate(data);
  };

  if (projectLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/portfolio')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Editar Projeto do Portfolio' : 'Novo Projeto do Portfolio'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Atualizar informações do projeto' : 'Adicionar novo projeto ao Portfolio'}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Multilingual Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Conteúdo Multilingue</CardTitle>
                    <CardDescription>Título e descrição em diferentes idiomas</CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAutoTranslate}
                    disabled={isTranslating}
                  >
                    {isTranslating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Languages className="mr-2 h-4 w-4" />
                    )}
                    Traduzir Automaticamente
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pt" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="pt">🇵🇹 Português *</TabsTrigger>
                    <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                    <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                    <TabsTrigger value="de">🇩🇪 Deutsch</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="pt" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="title_pt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Villa com vista para o mar" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description_pt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição *</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={5} placeholder="Descrição detalhada do projeto..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="fr" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="title_fr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titre</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Villa avec vue sur la mer" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description_fr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={5} placeholder="Description détaillée du projet..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="en" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="title_en"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Villa with sea view" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description_en"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={5} placeholder="Detailed project description..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="de" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="title_de"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titel</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Villa mit Meerblick" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description_de"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beschreibung</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={5} placeholder="Detaillierte Projektbeschreibung..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Localização</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Lagos, Algarve" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Região *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Algarve" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Lagos" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Morada</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Rua das Flores, 123" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Postal</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: 8600-123" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Imóvel</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="property_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Imóvel</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="apartment">Apartamento</SelectItem>
                          <SelectItem value="house">Moradia</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="land">Terreno</SelectItem>
                          <SelectItem value="commercial">Comercial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="operation_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Operação</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sale">Venda</SelectItem>
                          <SelectItem value="rent">Arrendamento</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (€)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder="Ex: 500000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="area_sqm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área (m²)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder="Ex: 150" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quartos</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder="Ex: 3" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Casas de Banho</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder="Ex: 2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parking_spaces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lugares de Estacionamento</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder="Ex: 2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Imagens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Imagem Principal</h4>
                  {mainImagePreview ? (
                    <div className="relative w-48 h-32">
                      <img src={mainImagePreview} alt="Main" className="w-full h-full object-cover rounded-lg" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => { setMainImage(null); setMainImagePreview(''); }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <ImageDropzone onFilesSelected={handleMainImageSelect} maxFiles={1} />
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Galeria de Imagens</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                    {galleryImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img src={img.image_url} alt={`Gallery ${index}`} className="w-full h-24 object-cover rounded-lg" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeGalleryImage(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <ImageDropzone onFilesSelected={handleGalleryImagesSelect} maxFiles={20} />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Etiquetas</CardTitle>
              </CardHeader>
              <CardContent>
                <TagsInput
                  value={tags}
                  onChange={setTags}
                  suggestions={['piscina', 'garagem', 'vista-mar', 'jardim', 'terraço', 'novo', 'renovado']}
                />
              </CardContent>
            </Card>

            {/* Media */}
            <Card>
              <CardHeader>
                <CardTitle>Mídia</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="video_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Vídeo (YouTube/Vimeo)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://www.youtube.com/watch?v=..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="virtual_tour_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Visita Virtual (Matterport)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://my.matterport.com/show/?m=..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Estado e Visibilidade</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="sold">Vendido</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormLabel className="mt-2">Destaque</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/portfolio')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isEditing ? 'Guardar Alterações' : 'Criar Projeto'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}

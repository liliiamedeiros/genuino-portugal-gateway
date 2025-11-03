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
import { Upload, X } from 'lucide-react';

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

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

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

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
    }
  }, [existingProject]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      let mainImageUrl = mainImagePreview;

      if (mainImage) {
        setUploading(true);
        const webpBlob = await convertToWebP(mainImage);
        const timestamp = Date.now();
        const path = `${formData.id || timestamp}/main-${timestamp}.webp`;
        
        const { url, error } = await uploadImageToStorage(webpBlob, path, supabase);
        
        if (error) throw error;
        mainImageUrl = url || '';
        setUploading(false);
      }

      const projectData = {
        id: formData.id || `project-${Date.now()}`,
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
        parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : null,
        featured: formData.featured,
        main_image: mainImageUrl,
        status: formData.status,
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
      setMainImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
                <Label htmlFor="id">ID do Projeto *</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="ex: vila-porto-center"
                  required
                />
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

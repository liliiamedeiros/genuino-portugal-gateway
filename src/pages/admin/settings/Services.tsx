import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultilingualInput } from '@/components/admin/MultilingualInput';
import { IconSelector } from '@/components/admin/IconSelector';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { Plus, Edit, Trash, ChevronUp, ChevronDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export default function ServicesSettings() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: { fr: '', en: '', de: '', pt: '' },
    description: { fr: '', en: '', de: '', pt: '' },
    icon_name: 'FileText',
  });

  const { data: services } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingService) {
        await supabase.from('services').update({
          title: formData.title,
          description: formData.description,
          icon_name: formData.icon_name,
        }).eq('id', editingService.id);
      } else {
        await supabase.from('services').insert({
          title: formData.title,
          description: formData.description,
          icon_name: formData.icon_name,
          order_index: services?.length || 0,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success(editingService ? 'Serviço atualizado!' : 'Serviço criado!');
      setOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('services').delete().eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Serviço removido!');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: 'up' | 'down' }) => {
      const service = services?.find(s => s.id === id);
      if (!service) return;

      const currentIndex = service.order_index;
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex < 0 || !services || newIndex >= services.length) return;

      const swapService = services.find(s => s.order_index === newIndex);
      if (!swapService) return;

      await supabase.from('services').update({ order_index: newIndex }).eq('id', service.id);
      await supabase.from('services').update({ order_index: currentIndex }).eq('id', swapService.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: { fr: '', en: '', de: '', pt: '' },
      description: { fr: '', en: '', de: '', pt: '' },
      icon_name: 'FileText',
    });
    setEditingService(null);
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      icon_name: service.icon_name,
    });
    setOpen(true);
  };

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-5 w-5" /> : null;
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Configurações - Serviços</h1>
            <p className="text-muted-foreground">Gerencie os serviços exibidos no site</p>
          </div>
          <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingService ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Ícone</label>
                  <IconSelector value={formData.icon_name} onChange={(val) => setFormData({ ...formData, icon_name: val })} />
                </div>
                <MultilingualInput
                  label="Título"
                  value={formData.title}
                  onChange={(val) => setFormData({ ...formData, title: val })}
                />
                <MultilingualInput
                  label="Descrição"
                  value={formData.description}
                  onChange={(val) => setFormData({ ...formData, description: val })}
                  type="textarea"
                />
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full">
                  {saveMutation.isPending ? 'Salvando...' : editingService ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Serviços Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Título (PT)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services?.map((service, index) => (
                  <TableRow key={service.id}>
                    <TableCell>{getIcon(service.icon_name)}</TableCell>
                    <TableCell className="font-medium">{(service.title as any).pt || ''}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {service.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => reorderMutation.mutate({ id: service.id, direction: 'up' })}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => reorderMutation.mutate({ id: service.id, direction: 'down' })}
                        disabled={index === (services?.length || 0) - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja remover este serviço?')) {
                            deleteMutation.mutate(service.id);
                          }
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

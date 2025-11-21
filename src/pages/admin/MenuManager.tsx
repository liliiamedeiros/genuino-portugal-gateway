import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2, Edit, Plus, Menu, ChevronUp, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface NavigationMenu {
  id: string;
  menu_type: string;
  label: Record<string, string>;
  path: string;
  icon_name: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function MenuManager() {
  const queryClient = useQueryClient();
  const [menuType, setMenuType] = useState<string>('main');
  const [editingItem, setEditingItem] = useState<NavigationMenu | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    labelPt: '',
    labelEn: '',
    labelFr: '',
    labelDe: '',
    path: '',
    iconName: '',
    orderIndex: 0,
    isActive: true,
  });

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['navigation-menus', menuType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('navigation_menus')
        .select('*')
        .eq('menu_type', menuType)
        .order('order_index');
      
      if (error) throw error;
      return data as NavigationMenu[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('navigation_menus').insert({
        menu_type: menuType,
        label: {
          pt: data.labelPt,
          en: data.labelEn,
          fr: data.labelFr,
          de: data.labelDe,
        },
        path: data.path,
        icon_name: data.iconName || null,
        order_index: data.orderIndex,
        is_active: data.isActive,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation-menus'] });
      toast.success('Item criado com sucesso!');
      handleCloseDialog();
    },
    onError: () => toast.error('Erro ao criar item')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from('navigation_menus').update({
        label: {
          pt: data.labelPt,
          en: data.labelEn,
          fr: data.labelFr,
          de: data.labelDe,
        },
        path: data.path,
        icon_name: data.iconName || null,
        order_index: data.orderIndex,
        is_active: data.isActive,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation-menus'] });
      toast.success('Item atualizado com sucesso!');
      handleCloseDialog();
    },
    onError: () => toast.error('Erro ao atualizar item')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('navigation_menus').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation-menus'] });
      toast.success('Item deletado com sucesso!');
    },
    onError: () => toast.error('Erro ao deletar item')
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase.from('navigation_menus').update({ order_index: newOrder }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation-menus'] });
      toast.success('Ordem atualizada!');
    }
  });

  const handleOpenDialog = (item?: NavigationMenu) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        labelPt: item.label.pt || '',
        labelEn: item.label.en || '',
        labelFr: item.label.fr || '',
        labelDe: item.label.de || '',
        path: item.path,
        iconName: item.icon_name || '',
        orderIndex: item.order_index,
        isActive: item.is_active,
      });
    } else {
      setEditingItem(null);
      setFormData({
        labelPt: '',
        labelEn: '',
        labelFr: '',
        labelDe: '',
        path: '',
        iconName: '',
        orderIndex: (menuItems?.length || 0),
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleReorder = (id: string, direction: 'up' | 'down') => {
    const item = menuItems?.find(m => m.id === id);
    if (!item || !menuItems) return;

    const currentIndex = menuItems.findIndex(m => m.id === id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= menuItems.length) return;

    const targetItem = menuItems[targetIndex];
    reorderMutation.mutate({ id: item.id, newOrder: targetItem.order_index });
    reorderMutation.mutate({ id: targetItem.id, newOrder: item.order_index });
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">📋 Gestão de Menus</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? '✏️ Editar Item' : '➕ Novo Item'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Label (Português)</Label>
                    <Input value={formData.labelPt} onChange={(e) => setFormData({ ...formData, labelPt: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Label (English)</Label>
                    <Input value={formData.labelEn} onChange={(e) => setFormData({ ...formData, labelEn: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Label (Français)</Label>
                    <Input value={formData.labelFr} onChange={(e) => setFormData({ ...formData, labelFr: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Label (Deutsch)</Label>
                    <Input value={formData.labelDe} onChange={(e) => setFormData({ ...formData, labelDe: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <Label>Path/URL</Label>
                  <Input value={formData.path} onChange={(e) => setFormData({ ...formData, path: e.target.value })} required placeholder="/example" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ícone (opcional)</Label>
                    <Input value={formData.iconName} onChange={(e) => setFormData({ ...formData, iconName: e.target.value })} placeholder="Home, Menu, etc" />
                  </div>
                  <div>
                    <Label>Ordem</Label>
                    <Input type="number" value={formData.orderIndex} onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="active" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                  <Label htmlFor="active">Ativo</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
                  <Button type="submit">{editingItem ? 'Salvar Alterações' : 'Criar Item'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <Label>Tipo de Menu</Label>
          <Select value={menuType} onValueChange={setMenuType}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main">Menu Principal</SelectItem>
              <SelectItem value="footer">Menu Rodapé</SelectItem>
              <SelectItem value="admin">Menu Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div>Carregando...</div>
        ) : (
          <Card className="p-6">
            <div className="space-y-2">
              {menuItems?.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Menu className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{item.label.pt}</div>
                      <div className="text-sm text-muted-foreground">{item.path}</div>
                    </div>
                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                      {item.is_active ? '🟢 Ativo' : '🔴 Inativo'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleReorder(item.id, 'up')} disabled={index === 0}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleReorder(item.id, 'down')} disabled={index === (menuItems?.length || 0) - 1}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

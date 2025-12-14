import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash, Shield, ShieldAlert, User2, Edit } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Users() {
  const queryClient = useQueryClient();
  const { userRole: currentUserRole } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'editor' as 'super_admin' | 'admin' | 'editor',
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) throw rolesError;

      return profiles.map(profile => ({
        ...profile,
        role: roles.find(r => r.user_id === profile.id)?.role || null,
      }));
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'create',
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role,
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Usuário criado',
        description: 'O usuário foi criado com sucesso',
      });
      setDialogOpen(false);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        role: 'editor',
      });
    },
    onError: (error: any) => {
      console.error('Create user error:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar o usuário',
        variant: 'destructive',
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async () => {
      if (!editingUser) throw new Error('No user selected');
      
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'update',
          userId: editingUser.id,
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Usuário atualizado',
        description: 'O usuário foi atualizado com sucesso',
      });
      setEditDialogOpen(false);
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        role: 'editor',
      });
    },
    onError: (error: any) => {
      console.error('Update user error:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o usuário',
        variant: 'destructive',
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'delete',
          userId,
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Usuário removido',
        description: 'O usuário foi removido com sucesso',
      });
    },
    onError: (error: any) => {
      console.error('Delete user error:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível remover o usuário',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserMutation.mutate();
  };

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      password: '',
      fullName: user.full_name || '',
      role: user.role || 'editor',
    });
    setEditDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 3xl:p-12 4xl:p-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl font-bold">Gestão de Usuários</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="min-h-touch 3xl:min-h-touch-lg">
                <Plus className="mr-2 h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6" />
                Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Usuário</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Função</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'super_admin' | 'admin' | 'editor') =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      {(currentUserRole === 'super_admin' || currentUserRole === 'admin') && (
                        <SelectItem value="admin">Administrador</SelectItem>
                      )}
                      {currentUserRole === 'super_admin' && (
                        <SelectItem value="super_admin">Super Administrador</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full min-h-touch 3xl:min-h-touch-lg" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? 'Criando...' : 'Criar Usuário'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label htmlFor="editFullName">Nome Completo</Label>
                <Input
                  id="editFullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editRole">Função</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'super_admin' | 'admin' | 'editor') =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    {(currentUserRole === 'super_admin' || currentUserRole === 'admin') && (
                      <SelectItem value="admin">Administrador</SelectItem>
                    )}
                    {currentUserRole === 'super_admin' && (
                      <SelectItem value="super_admin">Super Administrador</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full min-h-touch 3xl:min-h-touch-lg" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? 'Atualizando...' : 'Atualizar Usuário'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 3xl:h-16 3xl:w-16 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">
                        {user.role ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'super_admin' 
                              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                              : user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'super_admin' && <ShieldAlert className="h-3 w-3" />}
                            {user.role === 'admin' && <Shield className="h-3 w-3" />}
                            {user.role === 'editor' && <User2 className="h-3 w-3" />}
                            {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Administrador' : 'Editor'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('pt-PT')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(user)}
                            className="min-h-touch min-w-[44px] 3xl:min-h-touch-lg 3xl:min-w-[56px]"
                          >
                            <Edit className="h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja remover este usuário?')) {
                                deleteUserMutation.mutate(user.id);
                              }
                            }}
                            className="min-h-touch min-w-[44px] 3xl:min-h-touch-lg 3xl:min-w-[56px]"
                          >
                            <Trash className="h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
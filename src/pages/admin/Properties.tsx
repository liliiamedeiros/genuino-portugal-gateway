import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, Edit, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function Properties() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: projects, isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast({
        title: 'Imóvel removido',
        description: 'O imóvel foi removido com sucesso',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o imóvel',
        variant: 'destructive',
      });
    },
  });

  const filteredProjects = projects?.filter((project) =>
    project.title_pt.toLowerCase().includes(search.toLowerCase()) ||
    project.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 3xl:p-12 4xl:p-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 3xl:mb-8">
          <h1 className="text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl font-bold">Gestão de Imóveis</h1>
          <Button 
            onClick={() => navigate('/admin/properties/new')}
            className="min-h-touch 3xl:min-h-touch-lg 3xl:text-lg 4xl:text-xl 3xl:px-6 4xl:px-8"
          >
            <Plus className="mr-2 h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6" />
            Adicionar Novo Imóvel
          </Button>
        </div>

        <div className="mb-6 3xl:mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 3xl:h-5 3xl:w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou localização..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 3xl:pl-12 min-h-touch 3xl:min-h-touch-lg 3xl:text-lg"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12 3xl:p-16">
            <div className="animate-spin rounded-full h-12 w-12 3xl:h-16 3xl:w-16 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="3xl:text-lg 4xl:text-xl">
                  <TableHead className="3xl:py-4 4xl:py-5">Título</TableHead>
                  <TableHead className="3xl:py-4 4xl:py-5">Localização</TableHead>
                  <TableHead className="3xl:py-4 4xl:py-5 hidden sm:table-cell">Tipo</TableHead>
                  <TableHead className="3xl:py-4 4xl:py-5">Preço</TableHead>
                  <TableHead className="3xl:py-4 4xl:py-5 hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right 3xl:py-4 4xl:py-5">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 3xl:py-16 text-muted-foreground 3xl:text-lg">
                      Nenhum imóvel encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects?.map((project) => (
                    <TableRow key={project.id} className="3xl:text-base 4xl:text-lg">
                      <TableCell className="font-medium 3xl:py-4 4xl:py-5">{project.title_pt}</TableCell>
                      <TableCell className="3xl:py-4 4xl:py-5">{project.location}, {project.region}</TableCell>
                      <TableCell className="capitalize 3xl:py-4 4xl:py-5 hidden sm:table-cell">{project.property_type || '-'}</TableCell>
                      <TableCell className="3xl:py-4 4xl:py-5">
                        {project.price ? `€${project.price.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell className="3xl:py-4 4xl:py-5 hidden md:table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 3xl:px-3 3xl:py-1 rounded-full text-xs 3xl:text-sm font-medium ${
                          project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right 3xl:py-4 4xl:py-5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="min-h-touch min-w-touch 3xl:min-h-touch-lg 3xl:min-w-touch-lg"
                          onClick={() => navigate(`/admin/properties/edit/${project.id}`)}
                        >
                          <Edit className="h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="min-h-touch min-w-touch 3xl:min-h-touch-lg 3xl:min-w-touch-lg"
                          onClick={() => {
                            if (confirm('Tem certeza que deseja remover este imóvel?')) {
                              deleteMutation.mutate(project.id);
                            }
                          }}
                        >
                          <Trash className="h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6" />
                        </Button>
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

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ClientSelectorProps {
  value: string | null;
  onChange: (clientId: string) => void;
  placeholder?: string;
}

export const ClientSelector = ({
  value,
  onChange,
  placeholder = 'Selecionar cliente...',
}: ClientSelectorProps) => {
  const [search, setSearch] = useState('');

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients-selector', search],
    queryFn: async () => {
      let query = supabase
        .from('clients')
        .select('id, full_name, email')
        .eq('status', 'active')
        .order('full_name', { ascending: true });

      if (search) {
        query = query.or(
          `full_name.ilike.%${search}%,email.ilike.%${search}%`
        );
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Carregando...
            </SelectItem>
          ) : clients && clients.length > 0 ? (
            clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.full_name} ({client.email})
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-results" disabled>
              Nenhum cliente encontrado
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

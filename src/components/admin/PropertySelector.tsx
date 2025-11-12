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

interface PropertySelectorProps {
  value: string | null;
  onChange: (propertyId: string) => void;
  placeholder?: string;
}

export const PropertySelector = ({
  value,
  onChange,
  placeholder = 'Selecionar imóvel...',
}: PropertySelectorProps) => {
  const [search, setSearch] = useState('');

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties-selector', search],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('id, title_pt, location')
        .eq('status', 'active')
        .order('title_pt', { ascending: true });

      if (search) {
        query = query.or(
          `title_pt.ilike.%${search}%,location.ilike.%${search}%`
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
          placeholder="Pesquisar imóvel..."
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
          ) : properties && properties.length > 0 ? (
            properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.title_pt} - {property.location}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-results" disabled>
              Nenhum imóvel encontrado
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

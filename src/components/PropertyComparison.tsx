import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, Car, Check, X } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';

interface PropertyComparisonProps {
  propertyIds: string[];
}

export function PropertyComparison({ propertyIds }: PropertyComparisonProps) {
  const { language, formatCurrency } = useLanguage();
  const { removeFromCompare } = useCompare();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['compare-properties', propertyIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .in('id', propertyIds);
      
      if (error) throw error;
      return data;
    },
    enabled: propertyIds.length > 0,
  });

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!properties || properties.length === 0) {
    return <div className="text-center py-8">Nenhum imóvel selecionado</div>;
  }

  const getTitle = (property: any) => {
    switch (language) {
      case 'fr': return property.title_fr;
      case 'en': return property.title_en;
      case 'de': return property.title_de;
      default: return property.title_pt;
    }
  };

  const features = [
    { key: 'piscina', label: { pt: 'Piscina', en: 'Pool', fr: 'Piscine', de: 'Pool' } },
    { key: 'jardim', label: { pt: 'Jardim', en: 'Garden', fr: 'Jardin', de: 'Garten' } },
    { key: 'ar_condicionado', label: { pt: 'Ar Condicionado', en: 'Air Conditioning', fr: 'Climatisation', de: 'Klimaanlage' } },
    { key: 'varanda', label: { pt: 'Varanda', en: 'Balcony', fr: 'Balcon', de: 'Balkon' } },
    { key: 'terraco', label: { pt: 'Terraço', en: 'Terrace', fr: 'Terrasse', de: 'Terrasse' } },
  ];

  return (
    <div className="w-full">
      {/* Property Headers */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {properties.map(property => (
          <div key={property.id} className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
              onClick={() => removeFromCompare(property.id)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="aspect-video relative overflow-hidden rounded-lg mb-2">
              <img
                src={property.main_image || '/placeholder.svg'}
                alt={getTitle(property)}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-semibold text-sm mb-1">{getTitle(property)}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {property.location}
            </p>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <tbody>
            {/* Price */}
            <tr className="border-b bg-muted/30">
              <td className="p-3 font-medium">Preço</td>
              {properties.map(property => (
                <td key={property.id} className="p-3 font-semibold text-primary">
                  {property.price ? formatCurrency(property.price) : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Area */}
            <tr className="border-b">
              <td className="p-3 font-medium flex items-center gap-2">
                <Maximize className="h-4 w-4" /> Área
              </td>
              {properties.map(property => (
                <td key={property.id} className="p-3">
                  {property.area_sqm ? `${property.area_sqm} m²` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Bedrooms */}
            <tr className="border-b bg-muted/30">
              <td className="p-3 font-medium flex items-center gap-2">
                <Bed className="h-4 w-4" /> Quartos
              </td>
              {properties.map(property => (
                <td key={property.id} className="p-3">
                  {property.bedrooms || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Bathrooms */}
            <tr className="border-b">
              <td className="p-3 font-medium flex items-center gap-2">
                <Bath className="h-4 w-4" /> Casas de Banho
              </td>
              {properties.map(property => (
                <td key={property.id} className="p-3">
                  {property.bathrooms || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Parking */}
            <tr className="border-b bg-muted/30">
              <td className="p-3 font-medium flex items-center gap-2">
                <Car className="h-4 w-4" /> Garagem
              </td>
              {properties.map(property => (
                <td key={property.id} className="p-3">
                  {property.parking_spaces ? `${property.parking_spaces} lugar${property.parking_spaces > 1 ? 'es' : ''}` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Features Header */}
            <tr className="border-b bg-primary/10">
              <td colSpan={properties.length + 1} className="p-3 font-semibold text-center">
                Características
              </td>
            </tr>

            {/* Features */}
            {features.map((feature, idx) => (
              <tr key={feature.key} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                <td className="p-3 font-medium">
                  {feature.label[language as keyof typeof feature.label]}
                </td>
                {properties.map(property => {
                  const hasFeature = property.features?.[feature.key as keyof typeof property.features];
                  return (
                    <td key={property.id} className="p-3">
                      {hasFeature ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Action Buttons */}
            <tr>
              <td className="p-3 font-medium">Ações</td>
              {properties.map(property => (
                <td key={property.id} className="p-3">
                  <Link to={`/project/${property.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Detalhes
                    </Button>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

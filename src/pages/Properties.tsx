import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProjectCard } from '@/components/ProjectCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Home, MapPin, Euro } from 'lucide-react';

export default function Properties() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');

  const { data: properties, isLoading } = useQuery({
    queryKey: ['public-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredProperties = properties?.filter(property => {
    const title = property[`title_${language}` as keyof typeof property] as string || '';
    const description = property[`description_${language}` as keyof typeof property] as string || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = propertyTypeFilter === 'all' || property.property_type === propertyTypeFilter;
    const matchesRegion = regionFilter === 'all' || property.region === regionFilter;
    
    return matchesSearch && matchesType && matchesRegion;
  });

  const uniqueRegions = Array.from(new Set(properties?.map(p => p.region) || []));

  const getPropertyTypeLabel = (type: string) => {
    const labels: Record<string, Record<string, string>> = {
      apartment: { pt: 'Apartamento', fr: 'Appartement', en: 'Apartment', de: 'Wohnung' },
      house: { pt: 'Moradia', fr: 'Maison', en: 'House', de: 'Haus' },
      villa: { pt: 'Villa', fr: 'Villa', en: 'Villa', de: 'Villa' },
      land: { pt: 'Terreno', fr: 'Terrain', en: 'Land', de: 'Grundstück' },
    };
    return labels[type]?.[language] || type;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-primary pt-32 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
                {language === 'pt' && 'Imóveis Disponíveis'}
                {language === 'fr' && 'Biens Immobiliers Disponibles'}
                {language === 'en' && 'Available Properties'}
                {language === 'de' && 'Verfügbare Immobilien'}
              </h1>
              <p className="text-lg text-white/90 mb-8">
                {language === 'pt' && 'Explore nossa seleção de imóveis de qualidade em Portugal'}
                {language === 'fr' && 'Explorez notre sélection de biens immobiliers de qualité au Portugal'}
                {language === 'en' && 'Explore our selection of quality properties in Portugal'}
                {language === 'de' && 'Entdecken Sie unsere Auswahl hochwertiger Immobilien in Portugal'}
              </p>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-muted/30 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'pt' ? 'Pesquisar...' : language === 'fr' ? 'Rechercher...' : language === 'en' ? 'Search...' : 'Suchen...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Property Type Filter */}
              <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'pt' && 'Todos os Tipos'}
                    {language === 'fr' && 'Tous les Types'}
                    {language === 'en' && 'All Types'}
                    {language === 'de' && 'Alle Typen'}
                  </SelectItem>
                  <SelectItem value="apartment">{getPropertyTypeLabel('apartment')}</SelectItem>
                  <SelectItem value="house">{getPropertyTypeLabel('house')}</SelectItem>
                  <SelectItem value="villa">{getPropertyTypeLabel('villa')}</SelectItem>
                  <SelectItem value="land">{getPropertyTypeLabel('land')}</SelectItem>
                </SelectContent>
              </Select>

              {/* Region Filter */}
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'pt' && 'Todas as Regiões'}
                    {language === 'fr' && 'Toutes les Régions'}
                    {language === 'en' && 'All Regions'}
                    {language === 'de' && 'Alle Regionen'}
                  </SelectItem>
                  {uniqueRegions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {language === 'pt' && 'A carregar imóveis...'}
                  {language === 'fr' && 'Chargement des biens...'}
                  {language === 'en' && 'Loading properties...'}
                  {language === 'de' && 'Immobilien werden geladen...'}
                </p>
              </div>
            ) : filteredProperties && filteredProperties.length > 0 ? (
              <>
                <div className="mb-6 text-center">
                  <p className="text-muted-foreground">
                    {filteredProperties.length} {language === 'pt' ? 'imóveis encontrados' : language === 'fr' ? 'biens trouvés' : language === 'en' ? 'properties found' : 'Immobilien gefunden'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProperties.map((property) => (
                    <ProjectCard
                      key={property.id}
                      id={property.id}
                      title={property[`title_${language}` as keyof typeof property] as string}
                      location={property.location}
                      image={property.main_image || ''}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {language === 'pt' && 'Nenhum imóvel encontrado com os filtros selecionados'}
                  {language === 'fr' && 'Aucun bien trouvé avec les filtres sélectionnés'}
                  {language === 'en' && 'No properties found with selected filters'}
                  {language === 'de' && 'Keine Immobilien mit den ausgewählten Filtern gefunden'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

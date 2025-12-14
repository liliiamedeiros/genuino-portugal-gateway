import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProjectCard } from '@/components/ProjectCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Home, MapPin, X } from 'lucide-react';

// Feature definitions with translations and icons
const FEATURES_CONFIG = {
  piscina: { 
    icon: '🏊', 
    labels: { pt: 'Piscina', fr: 'Piscine', en: 'Pool', de: 'Pool' } 
  },
  ar_condicionado: { 
    icon: '❄️', 
    labels: { pt: 'Ar Condicionado', fr: 'Climatisation', en: 'Air Conditioning', de: 'Klimaanlage' } 
  },
  jardim: { 
    icon: '🌿', 
    labels: { pt: 'Jardim', fr: 'Jardin', en: 'Garden', de: 'Garten' } 
  },
  varanda: { 
    icon: '🏖️', 
    labels: { pt: 'Varanda', fr: 'Balcon', en: 'Balcony', de: 'Balkon' } 
  },
  terraco: { 
    icon: '☀️', 
    labels: { pt: 'Terraço', fr: 'Terrasse', en: 'Terrace', de: 'Terrasse' } 
  },
  lugar_garagem: { 
    icon: '🚗', 
    labels: { pt: 'Garagem', fr: 'Garage', en: 'Garage', de: 'Garage' } 
  },
  arrecadacao: { 
    icon: '📦', 
    labels: { pt: 'Arrecadação', fr: 'Cellier', en: 'Storage', de: 'Abstellraum' } 
  },
};

export default function Properties() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

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

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const clearFeatures = () => {
    setSelectedFeatures([]);
  };

  const filteredProperties = properties?.filter(property => {
    const title = property[`title_${language}` as keyof typeof property] as string || '';
    const description = property[`description_${language}` as keyof typeof property] as string || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = propertyTypeFilter === 'all' || property.property_type === propertyTypeFilter;
    const matchesRegion = regionFilter === 'all' || property.region === regionFilter;
    
    // Feature filtering
    const features = property.features as Record<string, boolean> | null;
    const matchesFeatures = selectedFeatures.length === 0 || 
      selectedFeatures.every(feat => features?.[feat] === true);
    
    return matchesSearch && matchesType && matchesRegion && matchesFeatures;
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
        <section className="relative bg-primary pt-28 sm:pt-32 3xl:pt-40 pb-16 sm:pb-20 3xl:pb-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
            <div className="max-w-4xl 3xl:max-w-5xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl 3xl:text-7xl 4xl:text-8xl font-serif font-bold text-white mb-4 sm:mb-6">
                {language === 'pt' && 'Imóveis Disponíveis'}
                {language === 'fr' && 'Biens Immobiliers Disponibles'}
                {language === 'en' && 'Available Properties'}
                {language === 'de' && 'Verfügbare Immobilien'}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl 3xl:text-2xl 4xl:text-3xl text-white/90 mb-6 sm:mb-8">
                {language === 'pt' && 'Explore nossa seleção de imóveis de qualidade em Portugal'}
                {language === 'fr' && 'Explorez notre sélection de biens immobiliers de qualité au Portugal'}
                {language === 'en' && 'Explore our selection of quality properties in Portugal'}
                {language === 'de' && 'Entdecken Sie unsere Auswahl hochwertiger Immobilien in Portugal'}
              </p>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-6 sm:py-8 3xl:py-10 bg-muted/30 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
            <div className="max-w-6xl 3xl:max-w-7xl mx-auto space-y-4 3xl:space-y-6">
              {/* Basic Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 3xl:gap-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 3xl:h-5 3xl:w-5 text-muted-foreground" />
                  <Input
                    placeholder={language === 'pt' ? 'Pesquisar...' : language === 'fr' ? 'Rechercher...' : language === 'en' ? 'Search...' : 'Suchen...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 min-h-touch 3xl:min-h-touch-lg 3xl:text-base 3xl:pl-12"
                  />
                </div>

                {/* Property Type Filter */}
                <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                  <SelectTrigger className="min-h-touch 3xl:min-h-touch-lg 3xl:text-base">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 3xl:h-5 3xl:w-5" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="3xl:text-base">
                      {language === 'pt' && 'Todos os Tipos'}
                      {language === 'fr' && 'Tous les Types'}
                      {language === 'en' && 'All Types'}
                      {language === 'de' && 'Alle Typen'}
                    </SelectItem>
                    <SelectItem value="apartment" className="3xl:text-base">{getPropertyTypeLabel('apartment')}</SelectItem>
                    <SelectItem value="house" className="3xl:text-base">{getPropertyTypeLabel('house')}</SelectItem>
                    <SelectItem value="villa" className="3xl:text-base">{getPropertyTypeLabel('villa')}</SelectItem>
                    <SelectItem value="land" className="3xl:text-base">{getPropertyTypeLabel('land')}</SelectItem>
                  </SelectContent>
                </Select>

                {/* Region Filter */}
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="min-h-touch 3xl:min-h-touch-lg 3xl:text-base">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 3xl:h-5 3xl:w-5" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="3xl:text-base">
                      {language === 'pt' && 'Todas as Regiões'}
                      {language === 'fr' && 'Toutes les Régions'}
                      {language === 'en' && 'All Regions'}
                      {language === 'de' && 'Alle Regionen'}
                    </SelectItem>
                    {uniqueRegions.map(region => (
                      <SelectItem key={region} value={region} className="3xl:text-base">{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Feature Filters */}
              <div className="space-y-2 3xl:space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm 3xl:text-base font-medium text-muted-foreground">
                    {language === 'pt' && 'Características:'}
                    {language === 'fr' && 'Caractéristiques:'}
                    {language === 'en' && 'Features:'}
                    {language === 'de' && 'Merkmale:'}
                  </p>
                  {selectedFeatures.length > 0 && (
                    <button 
                      onClick={clearFeatures}
                      className="text-xs 3xl:text-sm text-primary hover:underline flex items-center gap-1 min-h-touch 3xl:min-h-touch-lg px-2"
                    >
                      <X className="h-3 w-3 3xl:h-4 3xl:w-4" />
                      {language === 'pt' && 'Limpar'}
                      {language === 'fr' && 'Effacer'}
                      {language === 'en' && 'Clear'}
                      {language === 'de' && 'Löschen'}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 3xl:gap-3">
                  {Object.entries(FEATURES_CONFIG).map(([key, config]) => (
                    <Badge
                      key={key}
                      variant={selectedFeatures.includes(key) ? "default" : "outline"}
                      className={`cursor-pointer transition-all text-xs sm:text-sm 3xl:text-base py-1.5 px-3 3xl:py-2 3xl:px-4 min-h-touch 3xl:min-h-touch-lg ${
                        selectedFeatures.includes(key) 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => toggleFeature(key)}
                    >
                      <span className="mr-1.5 3xl:text-lg">{config.icon}</span>
                      {config.labels[language as keyof typeof config.labels]}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-8 sm:py-12 lg:py-16 3xl:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
            {isLoading ? (
              <div className="text-center py-12 3xl:py-16">
                <p className="text-muted-foreground 3xl:text-xl 4xl:text-2xl">
                  {language === 'pt' && 'A carregar imóveis...'}
                  {language === 'fr' && 'Chargement des biens...'}
                  {language === 'en' && 'Loading properties...'}
                  {language === 'de' && 'Immobilien werden geladen...'}
                </p>
              </div>
            ) : filteredProperties && filteredProperties.length > 0 ? (
              <>
                <div className="mb-6 3xl:mb-8 text-center">
                  <p className="text-muted-foreground 3xl:text-lg 4xl:text-xl">
                    {filteredProperties.length} {language === 'pt' ? 'imóveis encontrados' : language === 'fr' ? 'biens trouvés' : language === 'en' ? 'properties found' : 'Immobilien gefunden'}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 3xl:gap-10">
                  {filteredProperties.map((property) => (
                    <ProjectCard
                      key={property.id}
                      id={property.id}
                      title={property[`title_${language}` as keyof typeof property] as string}
                      location={property.location}
                      image={property.main_image || ''}
                      features={property.features as Record<string, boolean> | undefined}
                      price={property.price ?? undefined}
                      bedrooms={property.bedrooms ?? undefined}
                      area_sqm={property.area_sqm ?? undefined}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 3xl:py-16">
                <p className="text-muted-foreground text-lg 3xl:text-xl 4xl:text-2xl">
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
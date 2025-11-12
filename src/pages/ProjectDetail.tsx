import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowLeft, Bed, Bath, Square, Car } from 'lucide-react';

const translatePropertyType = (type: string | null, lang: string) => {
  if (!type) return '';
  const translations: Record<string, Record<string, string>> = {
    apartment: { pt: 'Apartamento', fr: 'Appartement', en: 'Apartment', de: 'Wohnung' },
    house: { pt: 'Moradia', fr: 'Maison', en: 'House', de: 'Haus' },
    villa: { pt: 'Villa', fr: 'Villa', en: 'Villa', de: 'Villa' },
    land: { pt: 'Terreno', fr: 'Terrain', en: 'Land', de: 'Grundstück' },
    commercial: { pt: 'Comercial', fr: 'Commercial', en: 'Commercial', de: 'Gewerbe' }
  };
  return translations[type]?.[lang] || type;
};

const translateOperationType = (type: string | null, lang: string) => {
  if (!type) return '';
  const translations: Record<string, Record<string, string>> = {
    sale: { pt: 'Venda', fr: 'Vente', en: 'Sale', de: 'Verkauf' },
    rent: { pt: 'Arrendamento', fr: 'Location', en: 'Rent', de: 'Miete' }
  };
  return translations[type]?.[lang] || type;
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { language } = useLanguage();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      // Trim ID to remove extra spaces
      const trimmedId = id?.trim();
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .ilike('id', trimmedId)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: galleryImages } = useQuery({
    queryKey: ['project-images', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_images')
        .select('*')
        .eq('project_id', id)
        .order('order_index');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!project,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-lg">
          {language === 'pt' && 'A carregar...'}
          {language === 'fr' && 'Chargement...'}
          {language === 'en' && 'Loading...'}
          {language === 'de' && 'Wird geladen...'}
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif font-bold mb-4">
            {language === 'pt' && 'Imóvel não encontrado'}
            {language === 'fr' && 'Bien immobilier non trouvé'}
            {language === 'en' && 'Property not found'}
            {language === 'de' && 'Immobilie nicht gefunden'}
          </h1>
          <Link to="/properties">
            <Button>
              {language === 'pt' && 'Voltar aos Imóveis'}
              {language === 'fr' && 'Retour aux Biens'}
              {language === 'en' && 'Back to Properties'}
              {language === 'de' && 'Zurück zu Immobilien'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const allImages = [
    project.main_image,
    ...(galleryImages?.map(img => img.image_url) || [])
  ].filter(Boolean);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative h-[60vh] overflow-hidden">
        <img
          src={project.main_image}
          alt={`${project[`title_${language}`]} – Luxurious real estate development in ${project.location}, ${project.region}, Portugal – Investment opportunity in Portuguese property`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Link to="/properties">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {language === 'pt' && 'Voltar aos Imóveis'}
              {language === 'fr' && 'Retour aux Biens'}
              {language === 'en' && 'Back to Properties'}
              {language === 'de' && 'Zurück zu Immobilien'}
            </Button>
          </Link>

          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-serif font-bold mb-4 animate-fade-in">
              {project[`title_${language}`]}
            </h1>
            <div className="flex items-center text-lg text-muted-foreground mb-8">
              <MapPin className="h-5 w-5 mr-2" />
              {project.location}, {project.region}
            </div>

            {/* Preço e Tipo */}
            <div className="bg-primary/5 rounded-lg p-6 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'pt' && 'Preço'}
                    {language === 'fr' && 'Prix'}
                    {language === 'en' && 'Price'}
                    {language === 'de' && 'Preis'}
                  </p>
                  <p className="text-4xl font-bold text-primary">
                    {project.price ? new Intl.NumberFormat('pt-PT', { 
                      style: 'currency', 
                      currency: 'EUR',
                      maximumFractionDigits: 0 
                    }).format(Number(project.price)) : '-'}
                  </p>
                </div>
                <div className="flex gap-4">
                  {project.property_type && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'pt' && 'Tipo'}
                        {language === 'fr' && 'Type'}
                        {language === 'en' && 'Type'}
                        {language === 'de' && 'Typ'}
                      </p>
                      <p className="font-semibold">{translatePropertyType(project.property_type, language)}</p>
                    </div>
                  )}
                  {project.operation_type && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'pt' && 'Operação'}
                        {language === 'fr' && 'Opération'}
                        {language === 'en' && 'Operation'}
                        {language === 'de' && 'Betrieb'}
                      </p>
                      <p className="font-semibold">{translateOperationType(project.operation_type, language)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Características */}
            {(project.bedrooms || project.bathrooms || project.area_sqm || project.parking_spaces) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {project.bedrooms && (
                  <div className="flex items-center gap-3 p-4 bg-secondary/10 rounded-lg">
                    <Bed className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{project.bedrooms}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'pt' && 'Quartos'}
                        {language === 'fr' && 'Chambres'}
                        {language === 'en' && 'Bedrooms'}
                        {language === 'de' && 'Schlafzimmer'}
                      </p>
                    </div>
                  </div>
                )}
                {project.bathrooms && (
                  <div className="flex items-center gap-3 p-4 bg-secondary/10 rounded-lg">
                    <Bath className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{project.bathrooms}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'pt' && 'Casas de Banho'}
                        {language === 'fr' && 'Salles de bain'}
                        {language === 'en' && 'Bathrooms'}
                        {language === 'de' && 'Badezimmer'}
                      </p>
                    </div>
                  </div>
                )}
                {project.area_sqm && (
                  <div className="flex items-center gap-3 p-4 bg-secondary/10 rounded-lg">
                    <Square className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{project.area_sqm}</p>
                      <p className="text-sm text-muted-foreground">m²</p>
                    </div>
                  </div>
                )}
                {project.parking_spaces && (
                  <div className="flex items-center gap-3 p-4 bg-secondary/10 rounded-lg">
                    <Car className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{project.parking_spaces}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'pt' && 'Estacionamento'}
                        {language === 'fr' && 'Parking'}
                        {language === 'en' && 'Parking'}
                        {language === 'de' && 'Parkplatz'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-lg leading-relaxed">{project[`description_${language}`]}</p>
            </div>

            {/* Localização Detalhada */}
            {(project.city || project.address || project.postal_code) && (
              <div className="bg-secondary/10 rounded-lg p-6 mb-12">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {language === 'pt' && 'Localização Detalhada'}
                  {language === 'fr' && 'Emplacement détaillé'}
                  {language === 'en' && 'Detailed Location'}
                  {language === 'de' && 'Detaillierter Standort'}
                </h3>
                <div className="space-y-2">
                  {project.city && (
                    <p>
                      <strong>
                        {language === 'pt' && 'Cidade: '}
                        {language === 'fr' && 'Ville: '}
                        {language === 'en' && 'City: '}
                        {language === 'de' && 'Stadt: '}
                      </strong>
                      {project.city}
                    </p>
                  )}
                  {project.address && (
                    <p>
                      <strong>
                        {language === 'pt' && 'Endereço: '}
                        {language === 'fr' && 'Adresse: '}
                        {language === 'en' && 'Address: '}
                        {language === 'de' && 'Adresse: '}
                      </strong>
                      {project.address}
                    </p>
                  )}
                  {project.postal_code && (
                    <p>
                      <strong>
                        {language === 'pt' && 'Código Postal: '}
                        {language === 'fr' && 'Code postal: '}
                        {language === 'en' && 'Postal Code: '}
                        {language === 'de' && 'Postleitzahl: '}
                      </strong>
                      {project.postal_code}
                    </p>
                  )}
                  <p>
                    <strong>
                      {language === 'pt' && 'Região: '}
                      {language === 'fr' && 'Région: '}
                      {language === 'en' && 'Region: '}
                      {language === 'de' && 'Region: '}
                    </strong>
                    {project.region}
                  </p>
                </div>
              </div>
            )}

            {/* Gallery */}
            {allImages.length > 0 && (
              <div>
                <h2 className="text-3xl font-serif font-bold mb-6">
                  {language === 'pt' && 'Galeria'}
                  {language === 'fr' && 'Galerie'}
                  {language === 'en' && 'Gallery'}
                  {language === 'de' && 'Galerie'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${project[`title_${language}`]} – Luxury property in ${project.location}, Portugal – Photo ${index + 1}`}
                      className="w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

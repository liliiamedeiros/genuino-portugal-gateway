import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowLeft, Bed, Bath, Square, Car, Facebook, MessageCircle, Mail, Link as LinkIcon, Phone, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { PropertyImageCarousel } from '@/components/PropertyImageCarousel';
import { ImageLightbox } from '@/components/ImageLightbox';
import { OptimizedImage } from '@/components/OptimizedImage';

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = project?.title_pt || project?.title_fr || project?.title_en || "Imóvel";
    const text = `${title} - ${project?.location || ""}`;

    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank");
        break;
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success(
          language === "pt" ? "Link copiado!" :
          language === "fr" ? "Lien copié!" :
          language === "en" ? "Link copied!" :
          "Link kopiert!"
        );
        break;
    }
  };

  // Fetch project from database
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const trimmedId = id?.trim();
      
      const { data: projectData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', trimmedId)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) throw error;
      if (!projectData) return null;

      // Fetch gallery images
      const { data: imagesData } = await supabase
        .from('project_images')
        .select('*')
        .eq('project_id', trimmedId)
        .order('order_index');

      return {
        ...projectData,
        gallery: imagesData?.map(img => img.image_url) || [],
      };
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
      {project.json_ld && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(project.json_ld)}
          </script>
        </Helmet>
      )}
      
      {/* Hero */}
      <section className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] 3xl:h-[75vh] overflow-hidden bg-black">
        <OptimizedImage
          src={project.main_image}
          alt={`${project[`title_${language}`]} – Luxurious real estate development in ${project.location}, ${project.region}, Portugal – Investment opportunity in Portuguese property`}
          className="object-contain"
          containerClassName="w-full h-full"
          objectFit="contain"
          priority={true}
          sizes="100vw"
        />
      </section>

      {/* Content */}
      <section className="py-8 sm:py-12 3xl:py-16 4xl:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
          <Link to="/properties">
            <Button variant="ghost" className="mb-6 min-h-touch 3xl:min-h-touch-lg 3xl:text-base">
              <ArrowLeft className="mr-2 h-4 w-4 3xl:h-5 3xl:w-5" />
              {language === 'pt' && 'Voltar aos Imóveis'}
              {language === 'fr' && 'Retour aux Biens'}
              {language === 'en' && 'Back to Properties'}
              {language === 'de' && 'Zurück zu Immobilien'}
            </Button>
          </Link>

          <div className="max-w-4xl 3xl:max-w-5xl 4xl:max-w-6xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl 3xl:text-6xl 4xl:text-7xl font-serif font-bold mb-4 animate-fade-in">
              {project[`title_${language}`]}
            </h1>
            <div className="flex items-center text-base sm:text-lg 3xl:text-xl 4xl:text-2xl text-muted-foreground mb-6 sm:mb-8">
              <MapPin className="h-5 w-5 3xl:h-6 3xl:w-6 mr-2" />
              {project.location}, {project.region}
            </div>

            {/* Preço e Tipo */}
            <div className="bg-primary/5 rounded-lg p-4 sm:p-6 3xl:p-8 mb-6 sm:mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4 3xl:gap-6">
                <div>
                  <p className="text-sm 3xl:text-base text-muted-foreground mb-1">
                    {language === 'pt' && 'Preço'}
                    {language === 'fr' && 'Prix'}
                    {language === 'en' && 'Price'}
                    {language === 'de' && 'Preis'}
                  </p>
                  <p className="text-3xl sm:text-4xl 3xl:text-5xl 4xl:text-6xl font-bold text-primary">
                    {project.price ? new Intl.NumberFormat('pt-PT', { 
                      style: 'currency', 
                      currency: 'EUR',
                      maximumFractionDigits: 0 
                    }).format(Number(project.price)) : '-'}
                  </p>
                </div>
                <div className="flex gap-4 3xl:gap-6">
                  {project.property_type && (
                    <div>
                      <p className="text-sm 3xl:text-base text-muted-foreground">
                        {language === 'pt' && 'Tipo'}
                        {language === 'fr' && 'Type'}
                        {language === 'en' && 'Type'}
                        {language === 'de' && 'Typ'}
                      </p>
                      <p className="font-semibold 3xl:text-lg">{translatePropertyType(project.property_type, language)}</p>
                    </div>
                  )}
                  {project.operation_type && (
                    <div>
                      <p className="text-sm 3xl:text-base text-muted-foreground">
                        {language === 'pt' && 'Operação'}
                        {language === 'fr' && 'Opération'}
                        {language === 'en' && 'Operation'}
                        {language === 'de' && 'Betrieb'}
                      </p>
                      <p className="font-semibold 3xl:text-lg">{translateOperationType(project.operation_type, language)}</p>
                    </div>
                  )}
                </div>
              </div>
          </div>

        {/* Botões de Contacto */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 sm:p-6 3xl:p-8 mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl 3xl:text-2xl font-semibold mb-4">
            {language === 'pt' && 'Entre em Contacto'}
            {language === 'fr' && 'Nous Contacter'}
            {language === 'en' && 'Get in Touch'}
            {language === 'de' && 'Kontaktieren Sie uns'}
          </h3>
          <div className="flex flex-wrap gap-3 sm:gap-4 3xl:gap-5">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white min-h-touch 3xl:min-h-touch-lg 3xl:text-base"
              asChild
            >
              <a
                href={`https://wa.me/41784876000?text=${encodeURIComponent(
                  language === 'pt' ? `Olá! Tenho interesse no imóvel: ${project.title_pt || project.title_fr || project.title_en} em ${project.location}` :
                  language === 'fr' ? `Bonjour! Je suis intéressé par le bien: ${project.title_fr || project.title_pt || project.title_en} à ${project.location}` :
                  language === 'en' ? `Hello! I'm interested in the property: ${project.title_en || project.title_pt || project.title_fr} in ${project.location}` :
                  `Hallo! Ich interessiere mich für die Immobilie: ${project.title_de || project.title_en || project.title_pt} in ${project.location}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-5 w-5 3xl:h-6 3xl:w-6" />
                WhatsApp
              </a>
            </Button>
            
            <Button size="lg" variant="outline" className="min-h-touch 3xl:min-h-touch-lg 3xl:text-base" asChild>
              <a href={`mailto:info@genuinoinvestments.ch?subject=${encodeURIComponent(
                language === 'pt' ? `Interesse no imóvel: ${project.title_pt || project.title_fr || project.title_en}` :
                language === 'fr' ? `Intérêt pour le bien: ${project.title_fr || project.title_pt || project.title_en}` :
                language === 'en' ? `Interest in property: ${project.title_en || project.title_pt || project.title_fr}` :
                `Interesse an Immobilie: ${project.title_de || project.title_en || project.title_pt}`
              )}`}>
                <Mail className="mr-2 h-5 w-5 3xl:h-6 3xl:w-6" />
                Email
              </a>
            </Button>
            
            <Button size="lg" variant="outline" className="min-h-touch 3xl:min-h-touch-lg 3xl:text-base" asChild>
              <Link to="/contact">
                <Phone className="mr-2 h-5 w-5 3xl:h-6 3xl:w-6" />
                {language === 'pt' && 'Agendar Visita'}
                {language === 'fr' && 'Planifier une visite'}
                {language === 'en' && 'Schedule Visit'}
                {language === 'de' && 'Besuch planen'}
              </Link>
            </Button>
          </div>
        </div>

        {/* Características */}
        {(project.bedrooms || project.bathrooms || project.area_sqm || project.parking_spaces) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 3xl:gap-6 mb-6 sm:mb-8">
                {project.bedrooms && (
                  <div className="flex items-center gap-3 p-3 sm:p-4 3xl:p-5 bg-secondary/10 rounded-lg">
                    <Bed className="h-5 w-5 sm:h-6 sm:w-6 3xl:h-8 3xl:w-8 text-primary" />
                    <div>
                      <p className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-bold">{project.bedrooms}</p>
                      <p className="text-xs sm:text-sm 3xl:text-base text-muted-foreground">
                        {language === 'pt' && 'Quartos'}
                        {language === 'fr' && 'Chambres'}
                        {language === 'en' && 'Bedrooms'}
                        {language === 'de' && 'Schlafzimmer'}
                      </p>
                    </div>
                  </div>
                )}
                {project.bathrooms && (
                  <div className="flex items-center gap-3 p-3 sm:p-4 3xl:p-5 bg-secondary/10 rounded-lg">
                    <Bath className="h-5 w-5 sm:h-6 sm:w-6 3xl:h-8 3xl:w-8 text-primary" />
                    <div>
                      <p className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-bold">{project.bathrooms}</p>
                      <p className="text-xs sm:text-sm 3xl:text-base text-muted-foreground">
                        {language === 'pt' && 'Casas de Banho'}
                        {language === 'fr' && 'Salles de bain'}
                        {language === 'en' && 'Bathrooms'}
                        {language === 'de' && 'Badezimmer'}
                      </p>
                    </div>
                  </div>
                )}
                {project.area_sqm && (
                  <div className="flex items-center gap-3 p-3 sm:p-4 3xl:p-5 bg-secondary/10 rounded-lg">
                    <Square className="h-5 w-5 sm:h-6 sm:w-6 3xl:h-8 3xl:w-8 text-primary" />
                    <div>
                      <p className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-bold">{project.area_sqm}</p>
                      <p className="text-xs sm:text-sm 3xl:text-base text-muted-foreground">m²</p>
                    </div>
                  </div>
                )}
                {project.parking_spaces && (
                  <div className="flex items-center gap-3 p-3 sm:p-4 3xl:p-5 bg-secondary/10 rounded-lg">
                    <Car className="h-5 w-5 sm:h-6 sm:w-6 3xl:h-8 3xl:w-8 text-primary" />
                    <div>
                      <p className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-bold">{project.parking_spaces}</p>
                      <p className="text-xs sm:text-sm 3xl:text-base text-muted-foreground">
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

            <div className="prose prose-lg 3xl:prose-xl max-w-none mb-8 sm:mb-12">
              <p className="text-base sm:text-lg 3xl:text-xl 4xl:text-2xl leading-relaxed">{project[`description_${language}`]}</p>
            </div>

            {/* Características do Imóvel */}
            {project.features && typeof project.features === 'object' && Object.values(project.features as Record<string, boolean>).some(v => v === true) && (
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4 sm:p-6 3xl:p-8 mb-8 sm:mb-12 border border-primary/10">
                <h3 className="text-lg sm:text-xl 3xl:text-2xl font-semibold mb-4 3xl:mb-6 flex items-center gap-2">
                  <span className="3xl:text-2xl">✨</span> {language === 'pt' && 'Características do Imóvel'}
                  {language === 'fr' && 'Caractéristiques du Bien'}
                  {language === 'en' && 'Property Features'}
                  {language === 'de' && 'Immobilienmerkmale'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 3xl:gap-4">
                  {(project.features as Record<string, boolean>).piscina && (
                    <div className="flex items-center gap-2 p-2 sm:p-3 3xl:p-4 bg-background rounded-lg shadow-sm">
                      <span className="text-lg sm:text-xl 3xl:text-2xl">🏊</span>
                      <span className="font-medium text-sm sm:text-base 3xl:text-lg">
                        {language === 'pt' ? 'Piscina' : language === 'fr' ? 'Piscine' : language === 'de' ? 'Pool' : 'Pool'}
                      </span>
                    </div>
                  )}
                  {(project.features as Record<string, boolean>).ar_condicionado && (
                    <div className="flex items-center gap-2 p-2 sm:p-3 3xl:p-4 bg-background rounded-lg shadow-sm">
                      <span className="text-lg sm:text-xl 3xl:text-2xl">❄️</span>
                      <span className="font-medium text-sm sm:text-base 3xl:text-lg">
                        {language === 'pt' ? 'Ar Condicionado' : language === 'fr' ? 'Climatisation' : language === 'de' ? 'Klimaanlage' : 'Air Conditioning'}
                      </span>
                    </div>
                  )}
                  {(project.features as Record<string, boolean>).varanda && (
                    <div className="flex items-center gap-2 p-2 sm:p-3 3xl:p-4 bg-background rounded-lg shadow-sm">
                      <span className="text-lg sm:text-xl 3xl:text-2xl">🌇</span>
                      <span className="font-medium text-sm sm:text-base 3xl:text-lg">
                        {language === 'pt' ? 'Varanda' : language === 'fr' ? 'Balcon' : language === 'de' ? 'Balkon' : 'Balcony'}
                      </span>
                    </div>
                  )}
                  {(project.features as Record<string, boolean>).terraco && (
                    <div className="flex items-center gap-2 p-2 sm:p-3 3xl:p-4 bg-background rounded-lg shadow-sm">
                      <span className="text-lg sm:text-xl 3xl:text-2xl">☀️</span>
                      <span className="font-medium text-sm sm:text-base 3xl:text-lg">
                        {language === 'pt' ? 'Terraço' : language === 'fr' ? 'Terrasse' : language === 'de' ? 'Terrasse' : 'Terrace'}
                      </span>
                    </div>
                  )}
                  {(project.features as Record<string, boolean>).lugar_garagem && (
                    <div className="flex items-center gap-2 p-2 sm:p-3 3xl:p-4 bg-background rounded-lg shadow-sm">
                      <span className="text-lg sm:text-xl 3xl:text-2xl">🚗</span>
                      <span className="font-medium text-sm sm:text-base 3xl:text-lg">
                        {language === 'pt' ? 'Garagem' : language === 'fr' ? 'Garage' : language === 'de' ? 'Garage' : 'Garage'}
                      </span>
                    </div>
                  )}
                  {(project.features as Record<string, boolean>).jardim && (
                    <div className="flex items-center gap-2 p-2 sm:p-3 3xl:p-4 bg-background rounded-lg shadow-sm">
                      <span className="text-lg sm:text-xl 3xl:text-2xl">🌿</span>
                      <span className="font-medium text-sm sm:text-base 3xl:text-lg">
                        {language === 'pt' ? 'Jardim' : language === 'fr' ? 'Jardin' : language === 'de' ? 'Garten' : 'Garden'}
                      </span>
                    </div>
                  )}
                  {(project.features as Record<string, boolean>).arrecadacao && (
                    <div className="flex items-center gap-2 p-2 sm:p-3 3xl:p-4 bg-background rounded-lg shadow-sm">
                      <span className="text-lg sm:text-xl 3xl:text-2xl">📦</span>
                      <span className="font-medium text-sm sm:text-base 3xl:text-lg">
                        {language === 'pt' ? 'Arrecadação' : language === 'fr' ? 'Cellier' : language === 'de' ? 'Abstellraum' : 'Storage'}
                      </span>
                    </div>
                  )}
                  {(project.features as Record<string, boolean>).casa_adaptada && (
                    <div className="flex items-center gap-2 p-2 sm:p-3 3xl:p-4 bg-background rounded-lg shadow-sm">
                      <span className="text-lg sm:text-xl 3xl:text-2xl">♿</span>
                      <span className="font-medium text-sm sm:text-base 3xl:text-lg">
                        {language === 'pt' ? 'Acessibilidade' : language === 'fr' ? 'Accessibilité' : language === 'de' ? 'Barrierefreiheit' : 'Accessibility'}
                      </span>
                    </div>
                  )}
                  {(project.features as Record<string, boolean>).ultimo_andar && (
                    <div className="flex items-center gap-2 p-2 sm:p-3 3xl:p-4 bg-background rounded-lg shadow-sm">
                      <span className="text-lg sm:text-xl 3xl:text-2xl">🏢</span>
                      <span className="font-medium text-sm sm:text-base 3xl:text-lg">
                        {language === 'pt' ? 'Último Andar' : language === 'fr' ? 'Dernier étage' : language === 'de' ? 'Obergeschoss' : 'Top Floor'}
                      </span>
                    </div>
                  )}
                  {(project.features as Record<string, boolean>).andares_intermedios && (
                    <div className="flex items-center gap-2 p-2 sm:p-3 3xl:p-4 bg-background rounded-lg shadow-sm">
                      <span className="text-lg sm:text-xl 3xl:text-2xl">🏬</span>
                      <span className="font-medium text-sm sm:text-base 3xl:text-lg">
                        {language === 'pt' ? 'Andar Intermédio' : language === 'fr' ? 'Étage intermédiaire' : language === 'de' ? 'Zwischengeschoss' : 'Middle Floor'}
                      </span>
                    </div>
                  )}
                  {(project.features as Record<string, boolean>).res_do_chao && (
                    <div className="flex items-center gap-2 p-2 sm:p-3 3xl:p-4 bg-background rounded-lg shadow-sm">
                      <span className="text-lg sm:text-xl 3xl:text-2xl">🏠</span>
                      <span className="font-medium text-sm sm:text-base 3xl:text-lg">
                        {language === 'pt' ? 'Rés-do-chão' : language === 'fr' ? 'Rez-de-chaussée' : language === 'de' ? 'Erdgeschoss' : 'Ground Floor'}
                      </span>
                    </div>
                  )}
                  {(project.features as Record<string, boolean>).multimedia && (
                    <div className="flex items-center gap-2 p-2 sm:p-3 3xl:p-4 bg-background rounded-lg shadow-sm">
                      <span className="text-lg sm:text-xl 3xl:text-2xl">📺</span>
                      <span className="font-medium text-sm sm:text-base 3xl:text-lg">
                        {language === 'pt' ? 'Multimédia' : language === 'fr' ? 'Multimédia' : language === 'de' ? 'Multimedia' : 'Multimedia'}
                      </span>
                    </div>
                  )}
                  {(project.features as Record<string, boolean>).com_planta && (
                    <div className="flex items-center gap-2 p-2 sm:p-3 3xl:p-4 bg-background rounded-lg shadow-sm">
                      <span className="text-lg sm:text-xl 3xl:text-2xl">📐</span>
                      <span className="font-medium text-sm sm:text-base 3xl:text-lg">
                        {language === 'pt' ? 'Com Planta' : language === 'fr' ? 'Avec plan' : language === 'de' ? 'Mit Grundriss' : 'With Floor Plan'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Localização Detalhada */}
            {(project.city || project.address || project.postal_code) && (
              <div className="bg-secondary/10 rounded-lg p-4 sm:p-6 3xl:p-8 mb-8 sm:mb-12">
                <h3 className="text-lg sm:text-xl 3xl:text-2xl font-semibold mb-4 3xl:mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5 3xl:h-6 3xl:w-6 text-primary" />
                  {language === 'pt' && 'Localização Detalhada'}
                  {language === 'fr' && 'Emplacement détaillé'}
                  {language === 'en' && 'Detailed Location'}
                  {language === 'de' && 'Detaillierter Standort'}
                </h3>
                <div className="space-y-2 3xl:space-y-3 3xl:text-lg">
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
                      {language === 'fr' && 'Região: '}
                      {language === 'en' && 'Region: '}
                      {language === 'de' && 'Region: '}
                    </strong>
                    {project.region}
                  </p>
                </div>
              </div>
            )}

            {/* Vídeo e Tour Virtual */}
            {(project.video_url || project.virtual_tour_url) && (
              <div className="mb-8 sm:mb-12">
                <h3 className="text-xl sm:text-2xl 3xl:text-3xl font-semibold mb-4 3xl:mb-6">
                  {language === 'pt' && 'Vídeo e Tour Virtual'}
                  {language === 'fr' && 'Vidéo et Visite Virtuelle'}
                  {language === 'en' && 'Video and Virtual Tour'}
                  {language === 'de' && 'Video und virtueller Rundgang'}
                </h3>
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6 3xl:gap-8">
                  {project.video_url && (
                    <div className="space-y-2 3xl:space-y-3">
                      <h4 className="font-semibold 3xl:text-lg flex items-center gap-2">
                        <span className="3xl:text-xl">🎥</span> {language === 'pt' && 'Vídeo do Imóvel'}
                        {language === 'fr' && 'Vidéo du bien'}
                        {language === 'en' && 'Property Video'}
                        {language === 'de' && 'Immobilienvideo'}
                      </h4>
                      <div className="rounded-lg overflow-hidden shadow-lg aspect-video">
                        <iframe
                          src={project.video_url.includes('youtube') 
                            ? project.video_url.replace('watch?v=', 'embed/') 
                            : project.video_url}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="Property Video"
                        />
                      </div>
                    </div>
                  )}
                  {project.virtual_tour_url && (
                    <div className="space-y-2 3xl:space-y-3">
                      <h4 className="font-semibold 3xl:text-lg flex items-center gap-2">
                        <span className="3xl:text-xl">🌐</span> {language === 'pt' && 'Tour Virtual 360°'}
                        {language === 'fr' && 'Visite Virtuelle 360°'}
                        {language === 'en' && 'Virtual Tour 360°'}
                        {language === 'de' && 'Virtueller Rundgang 360°'}
                      </h4>
                      <div className="rounded-lg overflow-hidden shadow-lg aspect-video">
                        <iframe
                          src={project.virtual_tour_url}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          title="Virtual Tour"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mapa de Localização */}
            {project.city && (
              <div className="mb-8 sm:mb-12">
                <h3 className="text-xl sm:text-2xl 3xl:text-3xl font-semibold mb-4 3xl:mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 3xl:h-7 3xl:w-7 text-primary" />
                  {language === 'pt' && 'Localização no Mapa'}
                  {language === 'fr' && 'Emplacement sur la carte'}
                  {language === 'en' && 'Map Location'}
                  {language === 'de' && 'Standort auf der Karte'}
                </h3>
                <div className="rounded-lg overflow-hidden shadow-lg h-[300px] sm:h-[400px] 3xl:h-[500px] 4xl:h-[600px]">
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      `${project.address || ''}, ${project.city}, ${project.region}, Portugal`
                    )}&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Property Location"
                  />
                </div>
              </div>
            )}

            {/* Partilha Social */}
            <div className="bg-secondary/5 rounded-lg p-4 sm:p-6 3xl:p-8 mb-8 sm:mb-12">
              <h3 className="text-lg sm:text-xl 3xl:text-2xl font-semibold mb-4 3xl:mb-6 flex items-center gap-2">
                <Share2 className="h-5 w-5 3xl:h-6 3xl:w-6 text-primary" />
                {language === 'pt' && 'Partilhar este imóvel'}
                {language === 'fr' && 'Partager ce bien'}
                {language === 'en' && 'Share this property'}
                {language === 'de' && 'Diese Immobilie teilen'}
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3 3xl:gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare("facebook")}
                  className="min-h-touch 3xl:min-h-touch-lg 3xl:text-base hover:bg-blue-600 hover:text-white hover:border-blue-600"
                >
                  <Facebook className="mr-2 h-5 w-5 3xl:h-6 3xl:w-6" />
                  Facebook
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare("whatsapp")}
                  className="min-h-touch 3xl:min-h-touch-lg 3xl:text-base hover:bg-green-600 hover:text-white hover:border-green-600"
                >
                  <MessageCircle className="mr-2 h-5 w-5 3xl:h-6 3xl:w-6" />
                  WhatsApp
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare("email")}
                  className="min-h-touch 3xl:min-h-touch-lg 3xl:text-base hover:bg-primary hover:text-primary-foreground"
                >
                  <Mail className="mr-2 h-5 w-5 3xl:h-6 3xl:w-6" />
                  Email
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare("copy")}
                  className="min-h-touch 3xl:min-h-touch-lg 3xl:text-base hover:bg-primary hover:text-primary-foreground"
                >
                  <LinkIcon className="mr-2 h-5 w-5 3xl:h-6 3xl:w-6" />
                  {language === 'pt' && 'Copiar Link'}
                  {language === 'fr' && 'Copier le lien'}
                  {language === 'en' && 'Copy Link'}
                  {language === 'de' && 'Link kopieren'}
                </Button>
              </div>
            </div>

            {/* Gallery */}
            {allImages.length > 0 && (
              <div>
                <h2 className="text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl font-serif font-bold mb-4 sm:mb-6 3xl:mb-8">
                  {language === 'pt' && 'Galeria de Fotos'}
                  {language === 'fr' && 'Galerie de Photos'}
                  {language === 'en' && 'Photo Gallery'}
                  {language === 'de' && 'Fotogalerie'}
                </h2>
                <PropertyImageCarousel
                  images={allImages}
                  alt={project[`title_${language}`] || ''}
                  onImageClick={(index) => {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                />
                
                <ImageLightbox
                  images={allImages}
                  initialIndex={lightboxIndex}
                  isOpen={lightboxOpen}
                  onClose={() => setLightboxOpen(false)}
                  alt={project[`title_${language}`] || ''}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

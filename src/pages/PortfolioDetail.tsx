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
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

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

export default function PortfolioDetail() {
  const { id } = useParams();
  const { language } = useLanguage();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = project?.title_pt || project?.title_fr || project?.title_en || "Projeto";
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

  // Fetch project from portfolio_projects table
  const { data: project, isLoading } = useQuery({
    queryKey: ['portfolio-project', id],
    queryFn: async () => {
      const { data: projectData, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) throw error;
      if (!projectData) return null;

      // Fetch gallery images from portfolio_images
      const { data: imagesData } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('portfolio_id', id)
        .order('order_index');

      return {
        ...projectData,
        gallery: imagesData?.map(img => img.image_url) || [],
      };
    },
  });

  // Fetch gallery images separately for lightbox
  const { data: galleryImages } = useQuery({
    queryKey: ['portfolio-images', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('portfolio_id', id)
        .order('order_index');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!project,
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <p className="text-lg">
            {language === 'pt' && 'A carregar...'}
            {language === 'fr' && 'Chargement...'}
            {language === 'en' && 'Loading...'}
            {language === 'de' && 'Wird geladen...'}
          </p>
        </div>
        <Footer />
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold mb-4">
              {language === 'pt' && 'Projeto não encontrado'}
              {language === 'fr' && 'Projet non trouvé'}
              {language === 'en' && 'Project not found'}
              {language === 'de' && 'Projekt nicht gefunden'}
            </h1>
            <Link to="/portfolio">
              <Button>
                {language === 'pt' && 'Voltar ao Portfólio'}
                {language === 'fr' && 'Retour au Portfolio'}
                {language === 'en' && 'Back to Portfolio'}
                {language === 'de' && 'Zurück zum Portfolio'}
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const allImages = [
    project.main_image,
    ...(galleryImages?.map(img => img.image_url) || [])
  ].filter(Boolean);

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20">
        {project.json_ld && (
          <Helmet>
            <script type="application/ld+json">
              {JSON.stringify(project.json_ld)}
            </script>
          </Helmet>
        )}
        
        {/* Hero */}
        <section className="relative h-[70vh] overflow-hidden bg-black">
          <img
            src={project.main_image}
            alt={`${project[`title_${language}` as keyof typeof project]} – Projeto de luxo em ${project.location}, ${project.region}, Portugal`}
            className="w-full h-full object-contain"
          />
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Link to="/portfolio">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {language === 'pt' && 'Voltar ao Portfólio'}
                {language === 'fr' && 'Retour au Portfolio'}
                {language === 'en' && 'Back to Portfolio'}
                {language === 'de' && 'Zurück zum Portfolio'}
              </Button>
            </Link>

            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl font-serif font-bold mb-4 animate-fade-in">
                {project[`title_${language}` as keyof typeof project] as string}
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

              {/* Botões de Contacto */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">
                  {language === 'pt' && 'Entre em Contacto'}
                  {language === 'fr' && 'Nous Contacter'}
                  {language === 'en' && 'Get in Touch'}
                  {language === 'de' && 'Kontaktieren Sie uns'}
                </h3>
                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    asChild
                  >
                    <a
                      href={`https://wa.me/41784876000?text=${encodeURIComponent(
                        language === 'pt' ? `Olá! Tenho interesse no projeto: ${project.title_pt || project.title_fr || project.title_en} em ${project.location}` :
                        language === 'fr' ? `Bonjour! Je suis intéressé par le projet: ${project.title_fr || project.title_pt || project.title_en} à ${project.location}` :
                        language === 'en' ? `Hello! I'm interested in the project: ${project.title_en || project.title_pt || project.title_fr} in ${project.location}` :
                        `Hallo! Ich interessiere mich für das Projekt: ${project.title_de || project.title_en || project.title_pt} in ${project.location}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      WhatsApp
                    </a>
                  </Button>
                  
                  <Button size="lg" variant="outline" asChild>
                    <a href={`mailto:info@genuinoinvestments.ch?subject=${encodeURIComponent(
                      language === 'pt' ? `Interesse no projeto: ${project.title_pt || project.title_fr || project.title_en}` :
                      language === 'fr' ? `Intérêt pour le projet: ${project.title_fr || project.title_pt || project.title_en}` :
                      language === 'en' ? `Interest in project: ${project.title_en || project.title_pt || project.title_fr}` :
                      `Interesse an Projekt: ${project.title_de || project.title_en || project.title_pt}`
                    )}`}>
                      <Mail className="mr-2 h-5 w-5" />
                      Email
                    </a>
                  </Button>
                  
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/contact">
                      <Phone className="mr-2 h-5 w-5" />
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
                <p className="text-lg leading-relaxed">{project[`description_${language}` as keyof typeof project] as string}</p>
              </div>

              {/* Características do Projeto */}
              {project.features && typeof project.features === 'object' && Object.values(project.features as Record<string, boolean>).some(v => v === true) && (
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-6 mb-12 border border-primary/10">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    ✨ {language === 'pt' && 'Características do Projeto'}
                    {language === 'fr' && 'Caractéristiques du Projet'}
                    {language === 'en' && 'Project Features'}
                    {language === 'de' && 'Projektmerkmale'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {(project.features as Record<string, boolean>).piscina && (
                      <div className="flex items-center gap-2 p-3 bg-background rounded-lg shadow-sm">
                        <span className="text-xl">🏊</span>
                        <span className="font-medium">
                          {language === 'pt' ? 'Piscina' : language === 'fr' ? 'Piscine' : language === 'de' ? 'Pool' : 'Pool'}
                        </span>
                      </div>
                    )}
                    {(project.features as Record<string, boolean>).ar_condicionado && (
                      <div className="flex items-center gap-2 p-3 bg-background rounded-lg shadow-sm">
                        <span className="text-xl">❄️</span>
                        <span className="font-medium">
                          {language === 'pt' ? 'Ar Condicionado' : language === 'fr' ? 'Climatisation' : language === 'de' ? 'Klimaanlage' : 'Air Conditioning'}
                        </span>
                      </div>
                    )}
                    {(project.features as Record<string, boolean>).varanda && (
                      <div className="flex items-center gap-2 p-3 bg-background rounded-lg shadow-sm">
                        <span className="text-xl">🌇</span>
                        <span className="font-medium">
                          {language === 'pt' ? 'Varanda' : language === 'fr' ? 'Balcon' : language === 'de' ? 'Balkon' : 'Balcony'}
                        </span>
                      </div>
                    )}
                    {(project.features as Record<string, boolean>).terraco && (
                      <div className="flex items-center gap-2 p-3 bg-background rounded-lg shadow-sm">
                        <span className="text-xl">☀️</span>
                        <span className="font-medium">
                          {language === 'pt' ? 'Terraço' : language === 'fr' ? 'Terrasse' : language === 'de' ? 'Terrasse' : 'Terrace'}
                        </span>
                      </div>
                    )}
                    {(project.features as Record<string, boolean>).lugar_garagem && (
                      <div className="flex items-center gap-2 p-3 bg-background rounded-lg shadow-sm">
                        <span className="text-xl">🚗</span>
                        <span className="font-medium">
                          {language === 'pt' ? 'Garagem' : language === 'fr' ? 'Garage' : language === 'de' ? 'Garage' : 'Garage'}
                        </span>
                      </div>
                    )}
                    {(project.features as Record<string, boolean>).jardim && (
                      <div className="flex items-center gap-2 p-3 bg-background rounded-lg shadow-sm">
                        <span className="text-xl">🌿</span>
                        <span className="font-medium">
                          {language === 'pt' ? 'Jardim' : language === 'fr' ? 'Jardin' : language === 'de' ? 'Garten' : 'Garden'}
                        </span>
                      </div>
                    )}
                    {(project.features as Record<string, boolean>).arrecadacao && (
                      <div className="flex items-center gap-2 p-3 bg-background rounded-lg shadow-sm">
                        <span className="text-xl">📦</span>
                        <span className="font-medium">
                          {language === 'pt' ? 'Arrecadação' : language === 'fr' ? 'Rangement' : language === 'de' ? 'Lagerraum' : 'Storage'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Galeria de Imagens */}
              {allImages.length > 1 && (
                <div className="mb-12">
                  <h3 className="text-2xl font-serif font-bold mb-6">
                    {language === 'pt' && 'Galeria de Fotos'}
                    {language === 'fr' && 'Galerie Photos'}
                    {language === 'en' && 'Photo Gallery'}
                    {language === 'de' && 'Fotogalerie'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {allImages.map((img, index) => (
                      <div
                        key={index}
                        className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          setLightboxIndex(index);
                          setLightboxOpen(true);
                        }}
                      >
                        <img
                          src={img}
                          alt={`${project[`title_${language}` as keyof typeof project]} - Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Partilhar */}
              <div className="bg-secondary/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  {language === 'pt' && 'Partilhar'}
                  {language === 'fr' && 'Partager'}
                  {language === 'en' && 'Share'}
                  {language === 'de' && 'Teilen'}
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" onClick={() => handleShare('facebook')}>
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleShare('whatsapp')}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleShare('email')}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleShare('copy')}>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    {language === 'pt' && 'Copiar Link'}
                    {language === 'fr' && 'Copier le lien'}
                    {language === 'en' && 'Copy Link'}
                    {language === 'de' && 'Link kopieren'}
                  </Button>
                </div>
              </div>

              {/* Video */}
              {project.video_url && (
                <div className="mt-12">
                  <h3 className="text-2xl font-serif font-bold mb-6">
                    {language === 'pt' && 'Vídeo'}
                    {language === 'fr' && 'Vidéo'}
                    {language === 'en' && 'Video'}
                    {language === 'de' && 'Video'}
                  </h3>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={project.video_url.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Virtual Tour */}
              {project.virtual_tour_url && (
                <div className="mt-12">
                  <h3 className="text-2xl font-serif font-bold mb-6">
                    {language === 'pt' && 'Tour Virtual 360°'}
                    {language === 'fr' && 'Visite Virtuelle 360°'}
                    {language === 'en' && '360° Virtual Tour'}
                    {language === 'de' && '360° Virtueller Rundgang'}
                  </h3>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={project.virtual_tour_url}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Mapa */}
              {project.map_embed_url && (
                <div className="mt-12">
                  <h3 className="text-2xl font-serif font-bold mb-6">
                    {language === 'pt' && 'Localização'}
                    {language === 'fr' && 'Emplacement'}
                    {language === 'en' && 'Location'}
                    {language === 'de' && 'Lage'}
                  </h3>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={project.map_embed_url}
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={allImages}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={lightboxIndex}
        alt={project[`title_${language}` as keyof typeof project] as string || 'Projeto'}
      />
      <Footer />
    </>
  );
}
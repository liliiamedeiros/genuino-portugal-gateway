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
    },
  });

  const { data: galleryImages } = useQuery({
    queryKey: ['project-images', id],
    queryFn: async () => {
      // If it's a static project, use its gallery array
      if (project?.isStatic && project?.gallery) {
        return project.gallery.map((url: string, index: number) => ({
          id: `static-${index}`,
          image_url: url,
          order_index: index,
          project_id: id
        }));
      }
      
      // Otherwise fetch from database
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
      <section className="relative h-[70vh] overflow-hidden bg-black">
        <img
          src={project.main_image}
          alt={`${project[`title_${language}`]} – Luxurious real estate development in ${project.location}, ${project.region}, Portugal – Investment opportunity in Portuguese property`}
          className="w-full h-full object-contain"
        />
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
                  language === 'pt' ? `Olá! Tenho interesse no imóvel: ${project.title_pt || project.title_fr || project.title_en} em ${project.location}` :
                  language === 'fr' ? `Bonjour! Je suis intéressé par le bien: ${project.title_fr || project.title_pt || project.title_en} à ${project.location}` :
                  language === 'en' ? `Hello! I'm interested in the property: ${project.title_en || project.title_pt || project.title_fr} in ${project.location}` :
                  `Hallo! Ich interessiere mich für die Immobilie: ${project.title_de || project.title_en || project.title_pt} in ${project.location}`
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
                language === 'pt' ? `Interesse no imóvel: ${project.title_pt || project.title_fr || project.title_en}` :
                language === 'fr' ? `Intérêt pour le bien: ${project.title_fr || project.title_pt || project.title_en}` :
                language === 'en' ? `Interest in property: ${project.title_en || project.title_pt || project.title_fr}` :
                `Interesse an Immobilie: ${project.title_de || project.title_en || project.title_pt}`
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
                      {language === 'fr' && 'Região: '}
                      {language === 'en' && 'Region: '}
                      {language === 'de' && 'Region: '}
                    </strong>
                    {project.region}
                  </p>
                </div>
              </div>
            )}

            {/* Mapa de Localização */}
            {project.city && (
              <div className="mb-12">
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-primary" />
                  {language === 'pt' && 'Localização no Mapa'}
                  {language === 'fr' && 'Emplacement sur la carte'}
                  {language === 'en' && 'Map Location'}
                  {language === 'de' && 'Standort auf der Karte'}
                </h3>
                <div className="rounded-lg overflow-hidden shadow-lg h-[400px]">
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
            <div className="bg-secondary/5 rounded-lg p-6 mb-12">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                {language === 'pt' && 'Partilhar este imóvel'}
                {language === 'fr' && 'Partager ce bien'}
                {language === 'en' && 'Share this property'}
                {language === 'de' && 'Diese Immobilie teilen'}
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare("facebook")}
                  className="hover:bg-blue-600 hover:text-white hover:border-blue-600"
                >
                  <Facebook className="mr-2 h-5 w-5" />
                  Facebook
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare("whatsapp")}
                  className="hover:bg-green-600 hover:text-white hover:border-green-600"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare("email")}
                  className="hover:bg-primary hover:text-primary-foreground"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Email
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare("copy")}
                  className="hover:bg-primary hover:text-primary-foreground"
                >
                  <LinkIcon className="mr-2 h-5 w-5" />
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
                <h2 className="text-3xl font-serif font-bold mb-6">
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

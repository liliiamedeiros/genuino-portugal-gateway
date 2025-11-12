import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { StatsSection } from '@/components/StatsSection';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.message) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // Simulate form submission
    toast.success('Message envoyé avec succès !');
    setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  };

  return (
    <>
      <SEOHead 
        title="Contacto"
        description="Entre em contato com Genuíno Investments. Escritórios em Lisboa e Genebra. Tel: +41 78 487 60 00 | Email: info@genuinoinvestments.ch"
        keywords="contacto genuino investments, email, telefone, escritórios"
        url="/contact"
      />
      <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, #877350 0%, #6d5d42 100%)' }}>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 animate-fade-in text-white">
            {t('contact.title')}
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto animate-slide-up text-white/90 leading-relaxed">
            {t('hero.contact')}
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="animate-slide-up">
              <h2 className="text-3xl font-serif font-bold mb-6">Envoyez-nous un message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                      Prénom
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                      {t('contact.name')}
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Téléphone
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    {t('contact.message')}
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  {t('contact.send')}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="animate-fade-in">
              <h2 className="text-3xl font-serif font-bold mb-6">{t('contact.info')}</h2>
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6 flex items-start gap-4">
                    <Phone className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Téléphone</h3>
                      <p className="text-muted-foreground">+41 78 487 60 00</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex items-start gap-4">
                    <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-muted-foreground">info@genuinoinvestments.ch</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Adresse</h3>
                      <p className="text-muted-foreground">
                        Geneva, Switzerland
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Map */}
              <div className="mt-8 rounded-lg overflow-hidden h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d86903.47889722069!2d6.062660450000001!3d46.2043907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478c64ef6f596d61%3A0x5c56b5110fcb7b15!2sGeneva%2C%20Switzerland!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Geneva Office Location"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />
      </div>
    </>
  );
}

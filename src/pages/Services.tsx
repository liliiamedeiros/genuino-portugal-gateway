import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Building2, Hammer, Megaphone, Scale, DollarSign } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

export default function Services() {
  const { t } = useLanguage();

  const services = [
    {
      icon: FileText,
      titleKey: 'services.economic.title',
      descKey: 'services.economic.desc',
      delay: '0s'
    },
    {
      icon: Building2,
      titleKey: 'services.project.title',
      descKey: 'services.project.desc',
      delay: '0.1s'
    },
    {
      icon: Hammer,
      titleKey: 'services.construction.title',
      descKey: 'services.construction.desc',
      delay: '0.2s'
    },
    {
      icon: Megaphone,
      titleKey: 'services.marketing.title',
      descKey: 'services.marketing.desc',
      delay: '0.3s'
    },
    {
      icon: Scale,
      titleKey: 'services.legal.title',
      descKey: 'services.legal.desc',
      delay: '0.4s'
    },
    {
      icon: DollarSign,
      titleKey: 'services.financing.title',
      descKey: 'services.financing.desc',
      delay: '0.5s'
    },
  ];

  return (
    <>
      <SEOHead 
        title="Serviços"
        description="Serviços completos de desenvolvimento imobiliário: estudos econômicos, gestão de projetos, construção, marketing e consultoria legal."
        keywords="serviços imobiliários, gestão projetos, construção, marketing imobiliário"
        url="/services"
      />
      <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, #877350 0%, #6d5d42 100%)' }}>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 animate-fade-in text-white">
            {t('nav.services')}
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto animate-slide-up text-white/90 leading-relaxed">
            {t('hero.services')}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card 
                  key={index}
                  className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fade-in border-2 hover:border-primary"
                  style={{ animationDelay: service.delay }}
                >
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                      <Icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold mb-4 text-primary uppercase">
                      {t(service.titleKey)}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t(service.descKey)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      </div>
    </>
  );
}

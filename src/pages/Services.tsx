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
      <section className="relative py-24 sm:py-28 lg:py-32 3xl:py-40 4xl:py-48 overflow-hidden" style={{ background: 'linear-gradient(135deg, #877350 0%, #6d5d42 100%)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl 3xl:text-7xl 4xl:text-8xl font-serif font-bold mb-4 sm:mb-6 3xl:mb-8 animate-fade-in text-white">
            {t('nav.services')}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl 3xl:text-3xl 4xl:text-4xl max-w-3xl 3xl:max-w-4xl mx-auto animate-slide-up text-white/90 leading-relaxed">
            {t('hero.services')}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 sm:py-20 3xl:py-28 4xl:py-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 3xl:gap-10 4xl:gap-12">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card 
                  key={index}
                  className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fade-in border-2 hover:border-primary"
                  style={{ animationDelay: service.delay }}
                >
                  <CardContent className="p-6 sm:p-8 3xl:p-10 4xl:p-12">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 3xl:w-20 3xl:h-20 4xl:w-24 4xl:h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 3xl:mb-8 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                      <Icon className="h-7 w-7 sm:h-8 sm:w-8 3xl:h-10 3xl:w-10 4xl:h-12 4xl:w-12 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
                    </div>
                    <h3 className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-serif font-bold mb-3 sm:mb-4 3xl:mb-6 text-primary uppercase">
                      {t(service.titleKey)}
                    </h3>
                    <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground leading-relaxed">
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
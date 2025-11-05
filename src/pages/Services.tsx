import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import * as LucideIcons from 'lucide-react';

export default function Services() {
  const { t, language } = useLanguage();

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      
      if (error) throw error;
      return data;
    },
  });

  return (
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
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services?.map((service, index) => {
                const Icon = (LucideIcons as any)[service.icon_name] || LucideIcons.FileText;
                const title = (service.title as any)[language] || (service.title as any).pt;
                const description = (service.description as any)[language] || (service.description as any).pt;
                
                return (
                  <Card 
                    key={service.id}
                    className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fade-in border-2 hover:border-primary"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-8">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                        <Icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
                      </div>
                      <h3 className="text-2xl font-serif font-bold mb-4 text-primary uppercase">
                        {title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

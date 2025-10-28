import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { Thermometer, Sun, Users, Waves } from 'lucide-react';

export const StatsSection = () => {
  const { t } = useLanguage();

  const stats = [
    {
      icon: Thermometer,
      value: 25,
      suffix: '°C',
      titleKey: 'stats.temperature',
      delay: '0s'
    },
    {
      icon: Sun,
      value: 330,
      suffix: '',
      titleKey: 'stats.sunnyDays',
      delay: '0.1s'
    },
    {
      icon: Users,
      value: 492,
      suffix: '',
      titleKey: 'stats.clients',
      delay: '0.2s'
    },
    {
      icon: Waves,
      value: 1800,
      suffix: ' km',
      titleKey: 'stats.coastline',
      delay: '0.3s'
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-secondary to-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 animate-fade-in"
                style={{ animationDelay: stat.delay }}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                    <Icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
                  </div>
                  <div className="text-4xl md:text-5xl font-serif font-bold text-primary mb-3">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2500} />
                  </div>
                  <h3 className="text-lg font-medium text-muted-foreground uppercase tracking-wide">
                    {t(stat.titleKey)}
                  </h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

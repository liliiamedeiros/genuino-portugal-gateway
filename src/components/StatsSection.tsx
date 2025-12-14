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
      suffix: '',
      titleKey: 'stats.beaches',
      delay: '0.3s'
    },
  ];

  return (
    <section className="py-16 sm:py-20 3xl:py-28 4xl:py-36 bg-gradient-to-b from-secondary to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 3xl:gap-8 4xl:gap-10">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 animate-fade-in"
                style={{ animationDelay: stat.delay }}
              >
                <CardContent className="p-6 sm:p-8 3xl:p-10 4xl:p-12 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 3xl:w-20 3xl:h-20 4xl:w-24 4xl:h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 3xl:mb-8 mx-auto group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                    <Icon className="h-7 w-7 sm:h-8 sm:w-8 3xl:h-10 3xl:w-10 4xl:h-12 4xl:w-12 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl 3xl:text-6xl 4xl:text-7xl font-serif font-bold text-primary mb-2 sm:mb-3 3xl:mb-4">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2500} />
                  </div>
                  <h3 className="text-base sm:text-lg 3xl:text-xl 4xl:text-2xl font-medium text-muted-foreground uppercase tracking-wide">
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
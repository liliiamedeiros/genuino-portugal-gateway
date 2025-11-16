import { useLanguage } from '@/contexts/LanguageContext';
import { ProjectCard } from '@/components/ProjectCard';
import { projects } from '@/data/projects';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function Portfolio() {
  const { t, language } = useLanguage();
  
  // Filter states
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  
  // Fetch projects from database
  const { data: dbProjects = [] } = useQuery({
    queryKey: ['projects-db'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Combine static and database projects
  const allProjects = useMemo(() => {
    const staticProjects = projects.map(p => ({
      ...p,
      source: 'static' as const,
      displayTitle: p.title[language],
      displayRegion: p.region,
      price: null,
      property_type: null
    }));
    
    const databaseProjects = dbProjects.map(p => ({
      ...p,
      source: 'database' as const,
      id: p.id,
      displayTitle: p[`title_${language}` as keyof typeof p] as string,
      location: p.location,
      displayRegion: p.region,
      mainImage: p.main_image,
      price: p.price ? Number(p.price) : null,
      property_type: p.property_type
    }));
    
    return [...staticProjects, ...databaseProjects];
  }, [dbProjects, language]);
  
  // Extract unique regions
  const uniqueRegions = useMemo(() => {
    const regions = new Set<string>();
    projects.forEach(p => regions.add(p.region));
    dbProjects.forEach(p => p.region && regions.add(p.region));
    return Array.from(regions).sort();
  }, [dbProjects]);
  
  // Filter projects
  const filteredProjects = useMemo(() => {
    return allProjects.filter(project => {
      // Region filter (works for both)
      if (regionFilter !== 'all' && project.displayRegion !== regionFilter) {
        return false;
      }
      
      // Property type filter (only for database projects)
      if (propertyTypeFilter !== 'all' && project.source === 'database') {
        if (project.property_type !== propertyTypeFilter) {
          return false;
        }
      }
      
      // Price filter (only for database projects with price)
      if (project.source === 'database' && project.price !== null) {
        const price = project.price;
        if (price < priceRange[0] || price > priceRange[1]) {
          return false;
        }
      }
      
      return true;
    });
  }, [allProjects, regionFilter, propertyTypeFilter, priceRange]);
  
  const clearFilters = () => {
    setRegionFilter('all');
    setPropertyTypeFilter('all');
    setPriceRange([0, 2000000]);
  };
  
  const hasActiveFilters = regionFilter !== 'all' || propertyTypeFilter !== 'all' || priceRange[0] !== 0 || priceRange[1] !== 2000000;

  return (
    <>
      <SEOHead 
        title="Portfólio"
        description="Explore nosso portfólio de projetos imobiliários de luxo em Portugal. Propriedades exclusivas em Algarve, Porto e Lisboa."
        keywords="portfólio imóveis Portugal, projetos imobiliários, propriedades luxo"
        url="/portfolio"
      />
      <div className="min-h-screen pt-20">
        {/* Hero */}
        <section className="relative py-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, #877350 0%, #6d5d42 100%)' }}>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 animate-fade-in text-white">
              {t('nav.portfolio')}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto animate-slide-up text-white/90 leading-relaxed">
              {t('hero.portfolio')}
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-muted/30 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              {/* Region Filter */}
              <div className="flex-1 w-full">
                <label className="text-sm font-medium mb-2 block text-foreground">
                  {t('filters.region')}
                </label>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('filters.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.all')}</SelectItem>
                    {uniqueRegions.map(region => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type Filter */}
              <div className="flex-1 w-full">
                <label className="text-sm font-medium mb-2 block text-foreground">
                  {t('filters.propertyType')}
                </label>
                <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('filters.allTypes')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
                    <SelectItem value="apartment">{t('filters.apartment')}</SelectItem>
                    <SelectItem value="house">{t('filters.house')}</SelectItem>
                    <SelectItem value="villa">{t('filters.villa')}</SelectItem>
                    <SelectItem value="land">{t('filters.land')}</SelectItem>
                    <SelectItem value="commercial">{t('filters.commercial')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div className="flex-1 w-full">
                <label className="text-sm font-medium mb-2 block text-foreground">
                  {t('filters.priceRange')}: €{priceRange[0].toLocaleString()} - €{priceRange[1].toLocaleString()}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  min={0}
                  max={2000000}
                  step={50000}
                  className="w-full"
                />
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="whitespace-nowrap"
                >
                  <X className="h-4 w-4 mr-2" />
                  {t('filters.clearFilters')}
                </Button>
              )}
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-muted-foreground">
              {filteredProjects.length > 0 ? (
                t('filters.resultsCount').replace('{{count}}', filteredProjects.length.toString())
              ) : (
                <span className="text-destructive">{t('filters.noResults')}</span>
              )}
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project, index) => (
                  <div
                    key={`${project.source}-${project.id}`}
                    className="group animate-scale-in hover:-translate-y-2 transition-all duration-500"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ProjectCard
                      id={project.id}
                      title={project.displayTitle}
                      location={`${project.location}, ${project.displayRegion}`}
                      image={project.source === 'static' ? project.mainImage : project.mainImage || ''}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">{t('filters.noResults')}</p>
                <Button onClick={clearFilters} className="mt-4">
                  {t('filters.clearFilters')}
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

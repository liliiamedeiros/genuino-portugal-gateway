import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProjectCard } from '@/components/ProjectCard';
import { SEOHead } from '@/components/SEOHead';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { useLanguage } from '@/contexts/LanguageContext';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export default function Portfolio() {
  const { t, language } = useLanguage();
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const PROJECTS_PER_PAGE = 12;

  const { data: queryResult, isLoading } = useQuery({
    queryKey: ['projects-paginated', currentPage, regionFilter, propertyTypeFilter, priceRange, sortBy],
    queryFn: async () => {
      let query = supabase.from('projects').select('*', { count: 'exact' }).eq('status', 'active');
      if (regionFilter !== 'all') query = query.eq('region', regionFilter);
      if (propertyTypeFilter !== 'all') query = query.eq('property_type', propertyTypeFilter);
      if (priceRange[0] > 0 || priceRange[1] < 2000000) query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);
      
      switch (sortBy) {
        case 'price-asc': query = query.order('price', { ascending: true, nullsFirst: false }); break;
        case 'price-desc': query = query.order('price', { ascending: false, nullsFirst: false }); break;
        case 'date-desc': query = query.order('created_at', { ascending: false }); break;
        case 'date-asc': query = query.order('created_at', { ascending: true }); break;
        case 'name-asc': query = query.order(`title_${language}`, { ascending: true }); break;
        case 'name-desc': query = query.order(`title_${language}`, { ascending: false }); break;
      }
      
      const from = (currentPage - 1) * PROJECTS_PER_PAGE;
      query = query.range(from, from + PROJECTS_PER_PAGE - 1);
      const { data, count, error } = await query;
      if (error) throw error;
      return { projects: data || [], total: count || 0 };
    }
  });

  const dbProjects = queryResult?.projects || [];
  const totalCount = queryResult?.total || 0;
  const totalPages = Math.ceil(totalCount / PROJECTS_PER_PAGE);

  const displayProjects = useMemo(() => dbProjects.map(p => ({
    id: p.id,
    displayTitle: String(p[`title_${language}` as keyof typeof p] || p.title_pt),
    location: p.location,
    image: p.main_image || '',
  })), [dbProjects, language]);

  const { data: allRegions } = useQuery({
    queryKey: ['all-regions'],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('region').eq('status', 'active');
      return Array.from(new Set(data?.map(p => p.region) || [])).sort();
    }
  });

  const clearFilters = () => {
    setRegionFilter('all');
    setPropertyTypeFilter('all');
    setPriceRange([0, 2000000]);
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  const hasActiveFilters = regionFilter !== 'all' || propertyTypeFilter !== 'all' || priceRange[0] !== 0 || priceRange[1] !== 2000000;

  useEffect(() => { setCurrentPage(1); }, [regionFilter, propertyTypeFilter, priceRange, sortBy]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentPage]);

  return (<>
    <SEOHead title="Portfólio" description="Explore nosso portfólio de projetos imobiliários de luxo em Portugal" url="/portfolio" />
    <Navbar />
    <div className="min-h-screen pt-20">
      <section className="py-16 bg-gradient-to-b from-background via-secondary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 bg-gradient-to-r from-primary via-[#887350] to-primary bg-clip-text text-transparent">
              {language === 'pt' ? 'Portfólio' : 'Portfolio'}
            </h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t('filters.region')}</label>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.all')}</SelectItem>
                {allRegions?.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t('filters.propertyType')}</label>
            <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.all')}</SelectItem>
                <SelectItem value="apartment">{t('filters.apartment')}</SelectItem>
                <SelectItem value="house">{t('filters.house')}</SelectItem>
                <SelectItem value="villa">{t('filters.villa')}</SelectItem>
                <SelectItem value="land">{t('filters.land')}</SelectItem>
                <SelectItem value="commercial">{t('filters.commercial')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t('filters.price')}</label>
            <Slider value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} min={0} max={2000000} step={50000} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{priceRange[0].toLocaleString()}€</span>
              <span>{priceRange[1].toLocaleString()}€</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t('sorting.label')}</label>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">{t('sorting.dateDesc')}</SelectItem>
                <SelectItem value="date-asc">{t('sorting.dateAsc')}</SelectItem>
                <SelectItem value="name-asc">{t('sorting.nameAsc')}</SelectItem>
                <SelectItem value="name-desc">{t('sorting.nameDesc')}</SelectItem>
                <SelectItem value="price-asc">{t('sorting.priceAsc')}</SelectItem>
                <SelectItem value="price-desc">{t('sorting.priceDesc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {hasActiveFilters && <Button onClick={clearFilters} variant="outline" className="mb-4">{t('filters.clearFilters')}</Button>}
        <div className="text-sm text-muted-foreground mb-8">
          {t('pagination.showing')} {displayProjects.length > 0 ? (currentPage - 1) * PROJECTS_PER_PAGE + 1 : 0}-{Math.min(currentPage * PROJECTS_PER_PAGE, totalCount)} {t('pagination.of')} {totalCount} {t('pagination.properties')}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : displayProjects.length > 0 ? (<>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProjects.map(p => <ProjectCard key={p.id} id={p.id} title={p.displayTitle} location={p.location} image={p.image} />)}
          </div>
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return <PaginationItem key={page}><PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">{page}</PaginationLink></PaginationItem>;
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <PaginationItem key={page}><PaginationEllipsis /></PaginationItem>;
                    }
                    return null;
                  })}
                  <PaginationItem>
                    <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhuma propriedade encontrada.</p>
            <Button onClick={clearFilters} variant="outline">{t('filters.clearFilters')}</Button>
          </div>
        )}
      </div>
    </div>
    <Footer />
  </>);
}

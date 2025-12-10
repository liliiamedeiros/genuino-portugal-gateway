import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProjectCard } from '@/components/ProjectCard';
import { SEOHead } from '@/components/SEOHead';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdvancedFilters } from '@/components/AdvancedFilters';
import { CompareBar } from '@/components/CompareBar';
import { Search, X, Loader2 } from 'lucide-react';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

interface PortfolioSettings {
  projects_per_page: number;
  default_sort: SortOption;
  show_filters: boolean;
  show_search: boolean;
  show_advanced_filters: boolean;
}

export default function Portfolio() {
  const { t, language } = useLanguage();
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [bedroomsFilter, setBedroomsFilter] = useState<number>(0);
  const [areaRange, setAreaRange] = useState<[number, number]>([0, 1000]);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Fetch portfolio settings from site_settings
  const { data: settings } = useQuery({
    queryKey: ['portfolio-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .eq('category', 'portfolio');
      
      if (error) throw error;
      
      const defaultSettings: PortfolioSettings = {
        projects_per_page: 12,
        default_sort: 'date-desc',
        show_filters: true,
        show_search: true,
        show_advanced_filters: true,
      };
      
      if (data) {
        data.forEach((setting) => {
          const value = (setting.value as { value: any })?.value;
          if (setting.key === 'projects_per_page') {
            const numValue = typeof value === 'number' ? value : parseInt(value, 10);
            if (!isNaN(numValue)) defaultSettings.projects_per_page = numValue;
          }
          if (setting.key === 'default_sort' && typeof value === 'string') {
            defaultSettings.default_sort = value as SortOption;
          }
          // Aceitar tanto boolean como string "true"/"false"
          if (setting.key === 'show_filters') {
            defaultSettings.show_filters = value === true || value === 'true';
          }
          if (setting.key === 'show_search') {
            defaultSettings.show_search = value === true || value === 'true';
          }
          if (setting.key === 'show_advanced_filters') {
            defaultSettings.show_advanced_filters = value === true || value === 'true';
          }
        });
      }
      
      return defaultSettings;
    }
  });

  const PROJECTS_PER_PAGE = settings?.projects_per_page || 12;

  // Set default sort from settings
  useEffect(() => {
    if (settings?.default_sort && sortBy === 'date-desc') {
      setSortBy(settings.default_sort);
    }
  }, [settings?.default_sort]);

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch projects from portfolio_projects table (separate from properties/projects)
  const { data: queryResult, isLoading } = useQuery({
    queryKey: ['portfolio-projects', currentPage, regionFilter, propertyTypeFilter, priceRange, bedroomsFilter, areaRange, sortBy, debouncedSearchText, selectedTags, PROJECTS_PER_PAGE],
    queryFn: async () => {
      let query = supabase.from('portfolio_projects').select('*', { count: 'exact' }).eq('status', 'active');
      
      // Text search across multiple fields
      if (debouncedSearchText) {
        query = query.or(`title_pt.ilike.%${debouncedSearchText}%,title_en.ilike.%${debouncedSearchText}%,title_fr.ilike.%${debouncedSearchText}%,title_de.ilike.%${debouncedSearchText}%,description_pt.ilike.%${debouncedSearchText}%,description_en.ilike.%${debouncedSearchText}%,description_fr.ilike.%${debouncedSearchText}%,description_de.ilike.%${debouncedSearchText}%,location.ilike.%${debouncedSearchText}%,city.ilike.%${debouncedSearchText}%`);
      }
      
      if (regionFilter !== 'all') query = query.eq('region', regionFilter);
      if (propertyTypeFilter !== 'all') query = query.eq('property_type', propertyTypeFilter);
      if (priceRange[0] > 0 || priceRange[1] < 2000000) query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);
      if (bedroomsFilter > 0) query = query.gte('bedrooms', bedroomsFilter);
      if (areaRange[0] > 0 || areaRange[1] < 1000) query = query.gte('area_sqm', areaRange[0]).lte('area_sqm', areaRange[1]);
      if (selectedTags.length > 0) query = query.contains('tags', selectedTags);
      
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
    },
    enabled: !!settings, // Only run after settings are loaded
  });

  const projects = queryResult?.projects || [];
  const totalCount = queryResult?.total || 0;
  const totalPages = Math.ceil(totalCount / PROJECTS_PER_PAGE);

  // Fetch available tags from portfolio_projects
  const { data: availableTags } = useQuery({
    queryKey: ['portfolio-available-tags'],
    queryFn: async () => {
      const { data } = await supabase.from('portfolio_projects').select('tags').eq('status', 'active');
      const allTags = new Set<string>();
      data?.forEach(p => {
        if (p.tags && Array.isArray(p.tags)) {
          p.tags.forEach(tag => allTags.add(tag));
        }
      });
      return Array.from(allTags).sort();
    }
  });

  // Map projects to display format
  const displayProjects = useMemo(() => {
    return projects.map(p => ({
      id: p.id,
      displayTitle: String(p[`title_${language}` as keyof typeof p] || p.title_pt),
      location: p.location,
      image: p.main_image || '',
    }));
  }, [projects, language]);

  // Fetch available regions from portfolio_projects
  const { data: allRegions } = useQuery({
    queryKey: ['portfolio-all-regions'],
    queryFn: async () => {
      const { data } = await supabase.from('portfolio_projects').select('region').eq('status', 'active');
      const regions = data?.map(p => p.region) || [];
      return Array.from(new Set(regions)).sort();
    }
  });

  const clearFilters = () => {
    setRegionFilter('all');
    setPropertyTypeFilter('all');
    setPriceRange([0, 2000000]);
    setBedroomsFilter(0);
    setAreaRange([0, 1000]);
    setSearchText('');
    setSelectedTags([]);
    setSortBy(settings?.default_sort || 'date-desc');
    setCurrentPage(1);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const hasActiveFilters = regionFilter !== 'all' || propertyTypeFilter !== 'all' || priceRange[0] !== 0 || priceRange[1] !== 2000000 || bedroomsFilter > 0 || areaRange[0] !== 0 || areaRange[1] !== 1000 || searchText !== '' || selectedTags.length > 0;

  useEffect(() => { setCurrentPage(1); }, [regionFilter, propertyTypeFilter, priceRange, bedroomsFilter, areaRange, sortBy, debouncedSearchText, selectedTags]);
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
        {/* Search Bar */}
        {settings?.show_search && (
          <div className="mb-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 pr-20"
              />
              {searchText && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchText('')}
                    className="h-7 px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Filters Badges */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">{t('filters.activeFilters')}:</span>
            {searchText && (
              <Badge variant="secondary" className="gap-1">
                {t('search.searchFor')}: {searchText}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchText('')} />
              </Badge>
            )}
            {selectedTags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleTag(tag)} />
              </Badge>
            ))}
            {regionFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {t('filters.region')}: {regionFilter}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setRegionFilter('all')} />
              </Badge>
            )}
            {propertyTypeFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {t('filters.propertyType')}: {t(`filters.${propertyTypeFilter}`)}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setPropertyTypeFilter('all')} />
              </Badge>
            )}
          </div>
        )}

        {/* Filters */}
        {settings?.show_filters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
        )}

        {/* Advanced Filters */}
        {settings?.show_advanced_filters && (
          <div className="mb-6">
            <AdvancedFilters
              bedroomsFilter={bedroomsFilter}
              onBedroomsChange={setBedroomsFilter}
              areaRange={areaRange}
              onAreaRangeChange={setAreaRange}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              availableTags={availableTags || []}
              isOpen={advancedFiltersOpen}
              onOpenChange={setAdvancedFiltersOpen}
              translations={{
                title: t('filters.advancedFilters'),
                bedrooms: t('filters.bedrooms'),
                bedroomsAll: t('filters.bedroomsAll'),
                area: t('filters.area'),
                areaMin: t('filters.areaMin'),
                areaMax: t('filters.areaMax'),
                price: t('filters.price'),
                priceMin: t('filters.priceMin'),
                priceMax: t('filters.priceMax'),
                tags: t('filters.tags'),
                tagsPlaceholder: t('filters.tagsPlaceholder'),
                clearAdvanced: t('filters.clearAdvanced')
              }}
            />
          </div>
        )}

        {hasActiveFilters && <Button onClick={clearFilters} variant="outline" className="mb-4">{t('filters.clearFilters')}</Button>}
        <div className="text-sm text-muted-foreground mb-8">
          {searchText && totalCount === 0 ? (
            <span>{t('search.noResults', { query: searchText })}</span>
          ) : (
            <span>{t('pagination.showing')} {displayProjects.length > 0 ? (currentPage - 1) * PROJECTS_PER_PAGE + 1 : 0}-{Math.min(currentPage * PROJECTS_PER_PAGE, totalCount)} {t('pagination.of')} {totalCount} {t('pagination.properties')}</span>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : displayProjects.length > 0 ? (<>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProjects.map(p => <ProjectCard key={p.id} id={p.id} title={p.displayTitle} location={p.location} image={p.image} linkPrefix="/portfolio" />)}
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
            <p className="text-muted-foreground mb-4">
              {searchText ? t('search.noResults', { query: searchText }) : t('filters.noResults')}
            </p>
            <Button onClick={clearFilters} variant="outline">{t('filters.clearFilters')}</Button>
          </div>
        )}
      </div>
    </div>
    <CompareBar />
    <Footer />
  </>);
}

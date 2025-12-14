import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProjectCard } from '@/components/ProjectCard';
import { SEOHead } from '@/components/SEOHead';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

interface PortfolioSettings {
  projects_per_page: number;
  default_sort: SortOption;
}

export default function Portfolio() {
  const { language } = useLanguage();
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [currentPage, setCurrentPage] = useState(1);

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

  // Fetch projects from portfolio_projects table
  const { data: queryResult, isLoading } = useQuery({
    queryKey: ['portfolio-projects', currentPage, sortBy, PROJECTS_PER_PAGE],
    queryFn: async () => {
      let query = supabase.from('portfolio_projects').select('*', { count: 'exact' }).eq('status', 'active');
      
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
    enabled: !!settings,
  });

  const projects = queryResult?.projects || [];
  const totalCount = queryResult?.total || 0;
  const totalPages = Math.ceil(totalCount / PROJECTS_PER_PAGE);

  // Map projects to display format
  const displayProjects = useMemo(() => {
    return projects.map(p => ({
      id: p.id,
      displayTitle: String(p[`title_${language}` as keyof typeof p] || p.title_pt),
      location: p.location,
      image: p.main_image || '',
    }));
  }, [projects, language]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentPage]);

  return (<>
    <SEOHead title="Portfólio" description="Explore nosso portfólio de projetos imobiliários de luxo em Portugal" url="/portfolio" />
    <Navbar />
    <div className="min-h-screen pt-20">
      <section className="py-12 sm:py-16 3xl:py-20 4xl:py-24 bg-gradient-to-b from-background via-secondary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
          <div className="max-w-4xl 3xl:max-w-5xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl 3xl:text-6xl 4xl:text-7xl font-serif font-bold mb-6 bg-gradient-to-r from-primary via-[#887350] to-primary bg-clip-text text-transparent">
              {language === 'pt' ? 'Portfólio' : 'Portfolio'}
            </h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16 pb-12 sm:pb-16 3xl:pb-20">
        {isLoading ? (
          <div className="flex justify-center py-12 3xl:py-16">
            <Loader2 className="h-8 w-8 3xl:h-12 3xl:w-12 4xl:h-16 4xl:w-16 animate-spin text-primary" />
          </div>
        ) : displayProjects.length > 0 ? (<>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 3xl:gap-10">
            {displayProjects.map(p => <ProjectCard key={p.id} id={p.id} title={p.displayTitle} location={p.location} image={p.image} linkPrefix="/portfolio" />)}
          </div>
          {totalPages > 1 && (
            <div className="mt-8 sm:mt-12 3xl:mt-16 flex justify-center">
              <Pagination>
                <PaginationContent className="gap-1 3xl:gap-2">
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={`min-h-touch 3xl:min-h-touch-lg 3xl:text-base ${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`} />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="min-h-touch 3xl:min-h-touch-lg 3xl:text-base cursor-pointer">{page}</PaginationLink>
                        </PaginationItem>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <PaginationItem key={page}><PaginationEllipsis className="3xl:text-base" /></PaginationItem>;
                    }
                    return null;
                  })}
                  <PaginationItem>
                    <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={`min-h-touch 3xl:min-h-touch-lg 3xl:text-base ${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>) : (
          <div className="text-center py-12 3xl:py-16">
            <p className="text-muted-foreground 3xl:text-xl 4xl:text-2xl">{language === 'pt' ? 'Nenhum projeto encontrado' : 'No projects found'}</p>
          </div>
        )}
      </div>
    </div>
    <Footer />
  </>);
}

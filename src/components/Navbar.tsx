import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Menu, X, LogIn } from 'lucide-react';
import logo from '@/assets/logo-switzerland.png';
import logoWhite from '@/assets/logo-white.png';

export const Navbar = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobileMenuOpen]);

  const { data: navLinks } = useQuery({
    queryKey: ['navigation-menus', 'main', language],
    queryFn: async () => {
      const { data } = await supabase
        .from('navigation_menus')
        .select('*')
        .eq('menu_type', 'main')
        .eq('is_active', true)
        .order('order_index');
      
      return data?.map(item => ({
        to: item.path,
        label: (item.label as Record<string, string>)?.[language] || (item.label as Record<string, string>)?.['pt'] || ''
      })) || [];
    }
  });

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 safe-area-top ${
          isScrolled 
            ? 'bg-primary shadow-lg' 
            : 'bg-background'
        }`}
      >
        <div className="container mx-auto px-4 3xl:px-8 4xl:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20 3xl:h-24 4xl:h-28">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src={isScrolled ? logoWhite : logo} 
                alt="Genuíno Investments Switzerland" 
                className="h-10 sm:h-16 3xl:h-20 4xl:h-24 w-auto transition-all duration-500 hover:scale-105" 
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-6 3xl:gap-8 4xl:gap-10">
              {navLinks?.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-xs xl:text-sm 3xl:text-base 4xl:text-lg font-serif font-semibold uppercase tracking-wider transition-all duration-300 relative group ${
                    isScrolled 
                      ? 'text-white hover:brightness-110' 
                      : 'text-primary hover:text-accent'
                  } ${isActive(link.to) ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-current transition-all duration-300 ${
                    isActive(link.to) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              ))}
              <LanguageSwitcher />
              <Button 
                asChild
                variant="ghost"
                size="sm"
                className={`gap-2 min-h-touch 3xl:min-h-touch-lg 3xl:text-base 4xl:text-lg ${
                  isScrolled 
                    ? 'text-white hover:bg-white/10' 
                    : 'text-primary hover:bg-primary/10'
                }`}
              >
                <Link to="/admin/login">
                  <LogIn className="h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6" />
                  <span>Entrar</span>
                </Link>
              </Button>
            </div>

            {/* Mobile/Tablet Menu Button */}
            <div className="lg:hidden flex items-center gap-1 sm:gap-2">
              <Button 
                asChild
                variant="ghost"
                size="sm"
                className={`h-11 w-11 p-0 ${isScrolled ? 'text-white hover:text-white/80' : ''}`}
              >
                <Link to="/admin/login" aria-label="Entrar">
                  <LogIn className="h-5 w-5" />
                </Link>
              </Button>
              <LanguageSwitcher />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`h-12 w-12 p-0 ${isScrolled ? 'text-white hover:text-white/80' : ''}`}
                aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile/Tablet Navigation Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
          
          {/* Menu Panel */}
          <div 
            className={`
              absolute top-16 sm:top-20 left-0 right-0 
              backdrop-blur-mobile safe-area-x
              border-b border-border shadow-xl
              animate-slide-in-top
              max-h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-5rem)]
              overflow-y-auto mobile-scroll
              ${isScrolled ? 'bg-primary/95' : 'bg-background/95'}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col gap-1">
                {navLinks?.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      text-base font-serif font-semibold uppercase tracking-wider 
                      transition-all duration-200 
                      py-4 px-4 rounded-lg 
                      min-h-[52px] flex items-center
                      active:scale-[0.98]
                      ${isScrolled 
                        ? 'text-white hover:bg-white/10 active:bg-white/20' 
                        : 'text-primary hover:bg-primary/5 active:bg-primary/10'
                      } 
                      ${isActive(link.to) 
                        ? isScrolled ? 'bg-white/15' : 'bg-primary/10' 
                        : ''
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

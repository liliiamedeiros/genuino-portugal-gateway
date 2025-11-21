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
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-primary shadow-lg' 
          : 'bg-background'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src={isScrolled ? logoWhite : logo} 
              alt="Genuíno Investments Switzerland" 
              className="h-16 w-auto transition-all duration-500 hover:scale-105" 
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks?.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-serif font-semibold uppercase tracking-wider transition-all duration-300 relative group ${
                  isScrolled 
                    ? 'text-white hover:brightness-110' 
                    : 'text-primary hover:text-accent'
                }`}
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            <LanguageSwitcher />
            <Button 
              asChild
              variant="ghost"
              size="sm"
              className={`gap-2 ${
                isScrolled 
                  ? 'text-white hover:bg-white/10' 
                  : 'text-primary hover:bg-primary/10'
              }`}
            >
              <Link to="/admin/login">
                <LogIn className="h-4 w-4" />
                <span>Entrar</span>
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Button 
              asChild
              variant="ghost"
              size="sm"
              className={isScrolled ? 'text-white hover:text-white/80' : ''}
            >
              <Link to="/admin/login">
                <LogIn className="h-4 w-4" />
              </Link>
            </Button>
            <LanguageSwitcher />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={isScrolled ? 'text-white hover:text-white/80' : ''}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks?.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-serif font-semibold uppercase tracking-wider transition-colors ${
                    isScrolled 
                      ? 'text-white hover:brightness-110' 
                      : 'text-primary hover:text-accent'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
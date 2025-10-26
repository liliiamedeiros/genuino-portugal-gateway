import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
export const Navbar = () => {
  const {
    t
  } = useLanguage();
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
  const navLinks = [{
    to: '/about',
    label: t('nav.about')
  }, {
    to: '/portfolio',
    label: t('nav.portfolio')
  }, {
    to: '/vision',
    label: t('nav.vision')
  }, {
    to: '/investors',
    label: t('nav.investors')
  }, {
    to: '/contact',
    label: t('nav.contact')
  }];
  const isActive = (path: string) => location.pathname === path;
  return <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="text-2xl font-serif font-bold text-primary hover:text-accent transition-colors">Genuíno Investments</Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => <Link key={link.to} to={link.to} className={`text-sm font-medium transition-colors hover:text-primary ${isActive(link.to) ? 'text-primary' : 'text-foreground'}`}>
                {link.label}
              </Link>)}
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map(link => <Link key={link.to} to={link.to} onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-medium transition-colors hover:text-primary ${isActive(link.to) ? 'text-primary' : 'text-foreground'}`}>
                  {link.label}
                </Link>)}
            </div>
          </div>}
      </div>
    </nav>;
};
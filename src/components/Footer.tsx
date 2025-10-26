import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-secondary py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-serif font-bold text-primary mb-4">Genuíno Investments</h3>
            <p className="text-sm text-muted-foreground">
              {t('home.about.text')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('nav.contact')}</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>+41 78 487 60 00</p>
              <p>info@genuinoinvestments.ch</p>
              <p>Geneva, Switzerland</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Suivez-nous</h4>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">{t('footer.rights')}</p>
            <div className="flex gap-6 text-sm">
              <Link to="/legal" className="text-muted-foreground hover:text-primary transition-colors">
                {t('footer.legal')}
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link to="/disputes" className="text-muted-foreground hover:text-primary transition-colors">
                {t('footer.disputes')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import logo from '@/assets/logo-switzerland.png';
import { NewsletterForm } from '@/components/NewsletterForm';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-background py-10 sm:py-12 lg:py-16 3xl:py-20 4xl:py-24 mt-16 sm:mt-20 border-t-2 border-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 3xl:gap-12 4xl:gap-16 mb-8 3xl:mb-12">
          <div>
            <img src={logo} alt="Genuíno Investments Switzerland" className="h-14 sm:h-16 3xl:h-20 4xl:h-24 w-auto mb-4 3xl:mb-6" />
            <p className="text-sm 3xl:text-base 4xl:text-lg text-muted-foreground leading-relaxed">
              Entreprise suisse, nous sommes spécialisés dans la promotion et le développement de projets immobiliers au Portugal, où nous allions innovation, fonctionnalité et design intemporel.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 3xl:mb-6 text-base 3xl:text-lg 4xl:text-xl">{t('nav.contact')}</h4>
            <div className="space-y-2 3xl:space-y-3 text-sm 3xl:text-base 4xl:text-lg text-muted-foreground">
              <p>+41 78 487 60 00</p>
              <p>info@genuinoinvestments.ch</p>
              <p>Geneva, Switzerland</p>
            </div>
          </div>

          <div>
            <h4 className="font-serif font-semibold mb-4 3xl:mb-6 uppercase text-primary text-base 3xl:text-lg 4xl:text-xl">Suivez-nous</h4>
            <div className="flex gap-4 3xl:gap-6">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-all hover:scale-110 min-h-touch min-w-touch flex items-center justify-center"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 3xl:h-6 3xl:w-6 4xl:h-8 4xl:w-8" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-all hover:scale-110 min-h-touch min-w-touch flex items-center justify-center"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 3xl:h-6 3xl:w-6 4xl:h-8 4xl:w-8" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-all hover:scale-110 min-h-touch min-w-touch flex items-center justify-center"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5 3xl:h-6 3xl:w-6 4xl:h-8 4xl:w-8" />
              </a>
            </div>
          </div>

          <div>
            <NewsletterForm />
          </div>
        </div>

        {/* Seção Institucional */}
        <div className="border-t border-border pt-6 sm:pt-8 3xl:pt-12 mt-6 sm:mt-8 3xl:mt-12">
          <div className="max-w-3xl 3xl:max-w-4xl mx-auto text-center">
            <h3 className="text-lg sm:text-xl 3xl:text-2xl 4xl:text-3xl font-serif font-bold mb-3 sm:mb-4 text-primary">
              Genuíno Investments
            </h3>
            <p className="text-xs sm:text-sm 3xl:text-base 4xl:text-lg mb-2 sm:mb-3 text-muted-foreground">
              Escritórios: Lisboa (Portugal) | Genève (Switzerland)
            </p>
            <p className="text-xs sm:text-sm 3xl:text-base 4xl:text-lg mb-3 sm:mb-4 text-muted-foreground">
              Investimentos Imobiliários – Férias, Praia e Campo
            </p>
            <div className="flex justify-center gap-2 sm:gap-3 text-xs sm:text-sm 3xl:text-base text-muted-foreground/75 flex-wrap">
              <span>Português</span>
              <span>•</span>
              <span>English</span>
              <span>•</span>
              <span>Français</span>
              <span>•</span>
              <span>Deutsch</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 sm:pt-8 3xl:pt-10 mt-6 sm:mt-8 3xl:mt-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 3xl:gap-6">
            <p className="text-xs sm:text-sm 3xl:text-base 4xl:text-lg text-muted-foreground text-center md:text-left">
              © 2025 Genuíno Investments. {t('footer.rights')}
            </p>
            <div className="flex gap-4 sm:gap-6 3xl:gap-8 text-xs sm:text-sm 3xl:text-base 4xl:text-lg">
              <Link 
                to="/legal" 
                className="text-muted-foreground hover:text-primary transition-colors min-h-touch flex items-center"
              >
                {t('footer.legal')}
              </Link>
              <Link 
                to="/privacy" 
                className="text-muted-foreground hover:text-primary transition-colors min-h-touch flex items-center"
              >
                {t('footer.privacy')}
              </Link>
              <Link 
                to="/disputes" 
                className="text-muted-foreground hover:text-primary transition-colors min-h-touch flex items-center"
              >
                {t('footer.disputes')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

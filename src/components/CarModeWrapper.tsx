import { ReactNode, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Home, Building2, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo-switzerland.png';

interface CarModeWrapperProps {
  children: ReactNode;
}

// Detects if the user is likely using a car display
const useCarMode = () => {
  const [isCarMode, setIsCarMode] = useState(false);

  useEffect(() => {
    // Check for car-related user agents or screen characteristics
    const checkCarMode = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isCarPlayOrAndroidAuto = 
        userAgent.includes('carplay') || 
        userAgent.includes('androidauto') ||
        userAgent.includes('car');
      
      // Also check for landscape mode with specific dimensions typical of car displays
      const isCarDimensions = 
        window.innerWidth >= 800 && 
        window.innerWidth <= 1280 && 
        window.innerHeight <= 480;

      // Check if user has explicitly enabled car mode via localStorage
      const manualCarMode = localStorage.getItem('carMode') === 'true';

      setIsCarMode(isCarPlayOrAndroidAuto || manualCarMode || (isCarDimensions && window.matchMedia('(orientation: landscape)').matches));
    };

    checkCarMode();
    window.addEventListener('resize', checkCarMode);
    return () => window.removeEventListener('resize', checkCarMode);
  }, []);

  return isCarMode;
};

export const CarModeWrapper = ({ children }: CarModeWrapperProps) => {
  const isCarMode = useCarMode();

  if (!isCarMode) {
    return <>{children}</>;
  }

  // Simplified car-friendly interface
  return (
    <div className="min-h-screen bg-background high-contrast">
      {/* Car Mode Header */}
      <header className="h-20 bg-card border-b-4 border-primary flex items-center justify-between px-6">
        <img src={logo} alt="Genuíno Investments" className="h-14" />
        <Button 
          variant="ghost" 
          size="lg"
          className="car-touch-target text-car-lg"
          onClick={() => {
            localStorage.setItem('carMode', 'false');
            window.location.reload();
          }}
        >
          Sair Modo Auto
        </Button>
      </header>

      {/* Car Mode Navigation - Large touch targets */}
      <nav className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <Link to="/">
            <Button 
              variant="outline" 
              className="w-full h-24 car-touch-target flex flex-col items-center justify-center gap-2 text-car-lg font-bold border-4"
            >
              <Home className="h-10 w-10" />
              <span>Início</span>
            </Button>
          </Link>
          
          <Link to="/portfolio">
            <Button 
              variant="outline" 
              className="w-full h-24 car-touch-target flex flex-col items-center justify-center gap-2 text-car-lg font-bold border-4"
            >
              <Building2 className="h-10 w-10" />
              <span>Imóveis</span>
            </Button>
          </Link>
          
          <a href="tel:+41784876000">
            <Button 
              variant="default" 
              className="w-full h-24 car-touch-target flex flex-col items-center justify-center gap-2 text-car-lg font-bold"
            >
              <Phone className="h-10 w-10" />
              <span>Ligar</span>
            </Button>
          </a>
          
          <a href="mailto:info@genuinoinvestments.ch">
            <Button 
              variant="outline" 
              className="w-full h-24 car-touch-target flex flex-col items-center justify-center gap-2 text-car-lg font-bold border-4"
            >
              <Mail className="h-10 w-10" />
              <span>Email</span>
            </Button>
          </a>
        </div>

        {/* Quick contact info */}
        <div className="mt-8 p-6 bg-secondary rounded-lg border-4 border-primary">
          <div className="flex items-center gap-4 mb-4">
            <Map className="h-8 w-8 text-primary shrink-0" />
            <div>
              <p className="text-car-lg font-bold">Genuíno Investments</p>
              <p className="text-lg text-muted-foreground">Geneva, Switzerland</p>
            </div>
          </div>
          <p className="text-car-xl font-bold text-primary">+41 78 487 60 00</p>
        </div>
      </nav>

      {/* Safety notice */}
      <div className="fixed bottom-0 left-0 right-0 bg-destructive/90 text-destructive-foreground p-4 text-center">
        <p className="text-lg font-bold">⚠️ Não utilize enquanto conduz</p>
      </div>
    </div>
  );
};

// Toggle button component for manually enabling car mode
export const CarModeToggle = () => {
  const toggleCarMode = () => {
    const current = localStorage.getItem('carMode') === 'true';
    localStorage.setItem('carMode', (!current).toString());
    window.location.reload();
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleCarMode}
      className="text-xs text-muted-foreground"
    >
      🚗 Modo Auto
    </Button>
  );
};

import { useEffect } from 'react';

export const useRoutePreload = () => {
  useEffect(() => {
    // Preload de rotas mais visitadas após 2 segundos
    const timer = setTimeout(() => {
      // Preload Portfolio (rota mais visitada)
      import('../pages/Portfolio');
      
      // Preload Properties
      import('../pages/Properties');
      
      // Preload Contact
      import('../pages/Contact');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
};

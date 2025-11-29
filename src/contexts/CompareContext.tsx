import { createContext, useContext, useState, ReactNode } from 'react';

interface CompareContextType {
  selectedProperties: string[];
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
  canAddMore: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const MAX_COMPARE = 3;

  const addToCompare = (id: string) => {
    if (selectedProperties.length < MAX_COMPARE && !selectedProperties.includes(id)) {
      setSelectedProperties(prev => [...prev, id]);
    }
  };

  const removeFromCompare = (id: string) => {
    setSelectedProperties(prev => prev.filter(propId => propId !== id));
  };

  const clearCompare = () => {
    setSelectedProperties([]);
  };

  const isInCompare = (id: string) => {
    return selectedProperties.includes(id);
  };

  const canAddMore = selectedProperties.length < MAX_COMPARE;

  return (
    <CompareContext.Provider
      value={{
        selectedProperties,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        canAddMore,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}

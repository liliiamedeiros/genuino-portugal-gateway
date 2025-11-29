import { useCompare } from '@/contexts/CompareContext';
import { Button } from '@/components/ui/button';
import { X, ArrowLeftRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { CompareModal } from './CompareModal';

export function CompareBar() {
  const { selectedProperties, removeFromCompare, clearCompare } = useCompare();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  if (selectedProperties.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-40 animate-in slide-in-from-bottom">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">
                {t('compare.comparing').replace('{count}', selectedProperties.length.toString())}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCompare}
              >
                {t('compare.clearAll')}
              </Button>
              <Button
                onClick={() => setShowModal(true)}
                disabled={selectedProperties.length < 2}
              >
                {t('compare.compareNow')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CompareModal 
        open={showModal} 
        onOpenChange={setShowModal}
      />
    </>
  );
}

import { useCompare } from '@/contexts/CompareContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { PropertyComparison } from './PropertyComparison';

interface CompareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompareModal({ open, onOpenChange }: CompareModalProps) {
  const { selectedProperties } = useCompare();
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('compare.title')}</DialogTitle>
        </DialogHeader>
        <PropertyComparison propertyIds={selectedProperties} />
      </DialogContent>
    </Dialog>
  );
}

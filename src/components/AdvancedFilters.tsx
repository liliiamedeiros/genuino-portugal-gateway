import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Home, Maximize2 } from 'lucide-react';

interface AdvancedFiltersProps {
  bedroomsFilter: number;
  onBedroomsChange: (value: number) => void;
  areaRange: [number, number];
  onAreaRangeChange: (value: [number, number]) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  translations: {
    title: string;
    bedrooms: string;
    bedroomsAll: string;
    area: string;
    areaMin: string;
    areaMax: string;
    clearAdvanced: string;
  };
}

export function AdvancedFilters({
  bedroomsFilter,
  onBedroomsChange,
  areaRange,
  onAreaRangeChange,
  isOpen,
  onOpenChange,
  translations
}: AdvancedFiltersProps) {
  const hasActiveFilters = bedroomsFilter > 0 || areaRange[0] !== 0 || areaRange[1] !== 1000;

  const clearAdvancedFilters = () => {
    onBedroomsChange(0);
    onAreaRangeChange([0, 1000]);
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={isOpen ? "filters" : ""}
      onValueChange={(value) => onOpenChange?.(value === "filters")}
      className="border rounded-lg bg-card"
    >
      <AccordionItem value="filters" className="border-none">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold">{translations.title}</span>
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                {[bedroomsFilter > 0, areaRange[0] !== 0 || areaRange[1] !== 1000].filter(Boolean).length}
              </span>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-2">
          <div className="space-y-6">
            {/* Bedrooms Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium">{translations.bedrooms}</label>
              </div>
              <ToggleGroup
                type="single"
                value={bedroomsFilter.toString()}
                onValueChange={(value) => onBedroomsChange(value ? parseInt(value) : 0)}
                className="justify-start flex-wrap"
              >
                <ToggleGroupItem value="0" className="min-w-[60px]">
                  {translations.bedroomsAll}
                </ToggleGroupItem>
                <ToggleGroupItem value="1" className="min-w-[60px]">
                  1+
                </ToggleGroupItem>
                <ToggleGroupItem value="2" className="min-w-[60px]">
                  2+
                </ToggleGroupItem>
                <ToggleGroupItem value="3" className="min-w-[60px]">
                  3+
                </ToggleGroupItem>
                <ToggleGroupItem value="4" className="min-w-[60px]">
                  4+
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Area Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium">{translations.area}</label>
              </div>
              <div className="px-2">
                <Slider
                  value={areaRange}
                  onValueChange={(value) => onAreaRangeChange(value as [number, number])}
                  min={0}
                  max={1000}
                  step={10}
                  className="mb-4"
                />
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">{translations.areaMin}:</span>
                    <span className="font-medium">{areaRange[0]}m²</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">{translations.areaMax}:</span>
                    <span className="font-medium">{areaRange[1]}m²</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAdvancedFilters}
                  className="w-full"
                >
                  {translations.clearAdvanced}
                </Button>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

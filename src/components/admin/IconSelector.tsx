import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const iconList = [
  'FileText', 'Building2', 'Hammer', 'Megaphone', 'Scale', 'DollarSign',
  'TrendingUp', 'Shield', 'Award', 'Target', 'Users', 'MapPin',
  'Phone', 'Mail', 'Calendar', 'Clock', 'Home', 'Heart',
  'Star', 'Briefcase', 'CheckCircle', 'Globe', 'Zap', 'Lightbulb'
];

export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [open, setOpen] = useState(false);

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-4 w-4" /> : null;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            {value && getIcon(value)}
            {value || "Selecionar ícone..."}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar ícone..." />
          <CommandEmpty>Nenhum ícone encontrado.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {iconList.map((iconName) => (
              <CommandItem
                key={iconName}
                value={iconName}
                onSelect={() => {
                  onChange(iconName);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === iconName ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex items-center gap-2">
                  {getIcon(iconName)}
                  <span>{iconName}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

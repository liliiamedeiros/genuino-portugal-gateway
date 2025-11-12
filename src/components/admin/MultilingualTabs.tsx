import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface MultilingualTabsProps {
  value: { pt?: string; fr?: string; en?: string; de?: string };
  onChange: (value: any, lang: string) => void;
  type: 'input' | 'textarea';
  label: string;
  required?: boolean;
  placeholder?: string;
}

const languages = [
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
];

export const MultilingualTabs = ({
  value,
  onChange,
  type,
  label,
  required,
  placeholder,
}: MultilingualTabsProps) => {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Tabs defaultValue="pt" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {languages.map((lang) => (
            <TabsTrigger key={lang.code} value={lang.code}>
              {lang.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {languages.map((lang) => (
          <TabsContent key={lang.code} value={lang.code}>
            {type === 'input' ? (
              <Input
                value={value[lang.code as keyof typeof value] || ''}
                onChange={(e) => onChange(e.target.value, lang.code)}
                placeholder={placeholder}
                required={required && lang.code === 'pt'}
              />
            ) : (
              <Textarea
                value={value[lang.code as keyof typeof value] || ''}
                onChange={(e) => onChange(e.target.value, lang.code)}
                placeholder={placeholder}
                rows={4}
                required={required && lang.code === 'pt'}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

type Language = 'fr' | 'en' | 'de' | 'pt';

interface MultilingualContent {
  fr: string;
  en: string;
  de: string;
  pt: string;
}

interface MultilingualInputProps {
  label: string;
  value: MultilingualContent;
  onChange: (value: MultilingualContent) => void;
  type?: 'input' | 'textarea';
  required?: boolean;
  placeholder?: string;
}

const languageLabels: Record<Language, string> = {
  fr: 'Français',
  en: 'English',
  de: 'Deutsch',
  pt: 'Português',
};

export function MultilingualInput({
  label,
  value,
  onChange,
  type = 'input',
  required = false,
  placeholder,
}: MultilingualInputProps) {
  const [activeTab, setActiveTab] = useState<Language>('pt');

  const handleChange = (lang: Language, newValue: string) => {
    onChange({
      ...value,
      [lang]: newValue,
    });
  };

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Language)}>
        <TabsList className="grid grid-cols-4 w-full">
          {(Object.keys(languageLabels) as Language[]).map((lang) => (
            <TabsTrigger key={lang} value={lang}>
              {languageLabels[lang]}
            </TabsTrigger>
          ))}
        </TabsList>
        {(Object.keys(languageLabels) as Language[]).map((lang) => (
          <TabsContent key={lang} value={lang}>
            {type === 'input' ? (
              <Input
                value={value[lang]}
                onChange={(e) => handleChange(lang, e.target.value)}
                placeholder={placeholder}
                required={required}
              />
            ) : (
              <Textarea
                value={value[lang]}
                onChange={(e) => handleChange(lang, e.target.value)}
                placeholder={placeholder}
                required={required}
                rows={6}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Mail } from 'lucide-react';

const newsletterSchema = z.object({
  email: z.string().email('Email inválido'),
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  language: z.enum(['pt', 'en', 'fr', 'de']),
});

export function NewsletterForm() {
  const { language: currentLanguage } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    language: currentLanguage,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      const validatedData = newsletterSchema.parse(formData);

      // Check if email already exists
      const { data: existingSubscriber } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', validatedData.email)
        .single();

      if (existingSubscriber) {
        toast({
          title: 'Já subscrito',
          description: 'Este email já está inscrito na nossa newsletter.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Subscribe to newsletter
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{
          email: validatedData.email,
          full_name: validatedData.full_name || null,
          language: validatedData.language,
          source: 'website',
          status: 'active',
        }]);

      if (error) throw error;

      toast({
        title: 'Subscrição realizada!',
        description: 'Obrigado por subscrever a nossa newsletter.',
      });

      // Reset form
      setFormData({
        email: '',
        full_name: '',
        language: currentLanguage,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Erro de validação',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro ao subscrever',
          description: 'Não foi possível realizar a subscrição. Por favor, tente novamente.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-muted/50 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Subscreva a nossa Newsletter</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Receba as últimas novidades sobre imóveis no Portugal diretamente no seu email.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newsletter-name">Nome (opcional)</Label>
          <Input
            id="newsletter-name"
            placeholder="Seu nome"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newsletter-email">Email *</Label>
          <Input
            id="newsletter-email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newsletter-language">Idioma Preferido</Label>
          <Select
            value={formData.language}
            onValueChange={(value: 'pt' | 'en' | 'fr' | 'de') =>
              setFormData({ ...formData, language: value })
            }
            disabled={isSubmitting}
          >
            <SelectTrigger id="newsletter-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt">Português</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Subscrevendo...' : 'Subscrever'}
        </Button>
      </form>
    </div>
  );
}

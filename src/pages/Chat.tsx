import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Phone, Mail } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Chat() {
  const { language } = useLanguage();
  const [message, setMessage] = useState('');
  
  const handleSend = () => {
    if (!message.trim()) return;
    // Open WhatsApp with message
    window.open(`https://wa.me/351XXXXXXXXX?text=${encodeURIComponent(message)}`, '_blank');
    setMessage('');
  };
  
  const translations = {
    pt: {
      title: 'Chat de Suporte',
      subtitle: 'Envie-nos uma mensagem e responderemos em breve',
      placeholder: 'Digite sua mensagem...',
      send: 'Enviar Mensagem',
      or: 'Ou entre em contato por',
    },
    fr: {
      title: 'Chat de Support',
      subtitle: 'Envoyez-nous un message et nous vous répondrons bientôt',
      placeholder: 'Tapez votre message...',
      send: 'Envoyer le Message',
      or: 'Ou contactez-nous par',
    },
    en: {
      title: 'Support Chat',
      subtitle: 'Send us a message and we will get back to you soon',
      placeholder: 'Type your message...',
      send: 'Send Message',
      or: 'Or contact us by',
    },
    de: {
      title: 'Support-Chat',
      subtitle: 'Senden Sie uns eine Nachricht und wir melden uns in Kürze',
      placeholder: 'Geben Sie Ihre Nachricht ein...',
      send: 'Nachricht Senden',
      or: 'Oder kontaktieren Sie uns per',
    },
  };
  
  const t = translations[language as keyof typeof translations];
  
  return (
    <>
      <SEOHead 
        title={t.title}
        description={t.subtitle}
      />
      
      <div className="min-h-screen pt-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <MessageCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl font-serif font-bold mb-4">
                {t.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t.subtitle}
              </p>
            </div>
            
            <div className="bg-card rounded-xl shadow-lg p-6 border mb-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t.placeholder}
                  </label>
                  <Textarea
                    placeholder={t.placeholder}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>
                
                <Button 
                  onClick={handleSend}
                  className="w-full"
                  disabled={!message.trim()}
                  size="lg"
                >
                  <Send className="mr-2 h-5 w-5" />
                  {t.send}
                </Button>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">{t.or}</p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm" asChild>
                  <a href="tel:+351XXXXXXXXX">
                    <Phone className="h-4 w-4 mr-2" />
                    Telefone
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="mailto:info@genuino-investments.com">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

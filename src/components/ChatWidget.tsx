import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChatbot } from '@/hooks/useChatbot';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

export const ChatWidget = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const { messages, isLoading, sendMessage, clearHistory } = useChatbot();
  
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if we're in admin area
  const isAdminArea = location.pathname.startsWith('/admin');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Delay focus on mobile to prevent keyboard issues
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, isMobile ? 300 : 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMobile]);

  // Prevent body scroll when chat is open on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobile, isOpen]);

  // Don't render in admin area
  if (isAdminArea) {
    return null;
  }

  const handleSend = async () => {
    if (inputValue.trim() && !isLoading) {
      await sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickSuggestions = [
    { icon: '🏊', text: t('chat.suggestions.pool') },
    { icon: '💰', text: t('chat.suggestions.price') },
    { icon: '🛏️', text: t('chat.suggestions.rooms') },
  ];

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl z-50 
                   bg-gradient-to-br from-primary to-accent 
                   hover:from-primary/90 hover:to-accent/90
                   transition-all duration-300 hover:scale-110
                   animate-pulse-slow border-2 border-primary-foreground/10
                   safe-area-bottom"
        style={{ 
          bottom: `calc(1.5rem + var(--safe-area-inset-bottom, 0px))`,
          right: `calc(1.5rem + var(--safe-area-inset-right, 0px))`
        }}
        aria-label={t('chat.title')}
      >
        <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
      </Button>
    );
  }

  return (
    <Card 
      className={`
        fixed z-50 
        bg-gradient-to-b from-background to-secondary/30
        border-2 border-primary/20 shadow-2xl 
        flex flex-col
        animate-in slide-in-from-bottom-4 zoom-in-95 duration-300
        ${isMobile 
          ? 'inset-0 rounded-none h-[100dvh] w-full' 
          : 'bottom-6 right-6 w-[400px] h-[650px] rounded-2xl max-h-[85vh]'
        }
      `}
      style={!isMobile ? { 
        bottom: `calc(1.5rem + var(--safe-area-inset-bottom, 0px))`,
        right: `calc(1.5rem + var(--safe-area-inset-right, 0px))`
      } : undefined}
    >
      {/* Header */}
      <div 
        className={`
          flex items-center justify-between p-4 border-b border-primary/10 
          bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5
          ${isMobile ? 'pt-[calc(1rem+var(--safe-area-inset-top,0px))]' : 'rounded-t-2xl'}
        `}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary to-accent 
                          flex items-center justify-center shadow-lg">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full 
                           border-2 border-background animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
              {t('chat.title')}
            </h3>
            <p className="text-xs text-muted-foreground">Online • Resposta rápida</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-11 w-11 rounded-full hover:bg-destructive/10 transition-colors"
          aria-label="Fechar chat"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 mobile-scroll" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <>
              <div className="flex justify-start animate-message-in">
                <div className="chat-bubble-assistant">
                  <p className="text-sm sm:text-base text-foreground">{t('chat.greeting')}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-xs text-muted-foreground px-1">Sugestões rápidas:</p>
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputValue(suggestion.text);
                      inputRef.current?.focus();
                    }}
                    className="chat-suggestion-button w-full text-left flex items-center gap-3"
                  >
                    <span className="text-xl">{suggestion.icon}</span>
                    <span className="text-sm text-foreground">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} 
                         animate-message-in`}
            >
              <div className={message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
                <p className={`text-sm sm:text-base whitespace-pre-wrap ${
                  message.role === 'user' ? 'text-primary-foreground' : 'text-foreground'
                }`}>
                  {message.content}
                </p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString('pt-PT', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-message-in">
              <div className="chat-bubble-assistant">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" 
                          style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" 
                          style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" 
                          style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{t('chat.thinking')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div 
        className={`
          p-4 border-t border-primary/10 bg-gradient-to-r from-primary/5 via-background to-accent/5
          ${isMobile ? 'pb-[calc(1rem+var(--safe-area-inset-bottom,0px))]' : ''}
        `}
      >
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('chat.placeholder')}
            disabled={isLoading}
            className="chat-input-field flex-1 h-12 text-base"
            enterKeyHint="send"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90
                     transition-all duration-200 shadow-md hover:shadow-lg rounded-xl h-12 w-12 p-0 shrink-0"
            aria-label="Enviar mensagem"
          >
            <Send className="h-5 w-5 text-primary-foreground" />
          </Button>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-3 py-2"
          >
            Limpar histórico
          </button>
        )}
      </div>
    </Card>
  );
};

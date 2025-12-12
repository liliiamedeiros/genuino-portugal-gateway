import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Minimize2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChatbot } from '@/hooks/useChatbot';
import { Card } from '@/components/ui/card';

export const ChatWidget = () => {
  const location = useLocation();
  
  // Não mostrar na área de administração
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { messages, isLoading, sendMessage, clearHistory } = useChatbot();
  const { t } = useLanguage();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl z-50 
                   bg-gradient-to-br from-primary to-accent 
                   hover:from-primary/90 hover:to-accent/90
                   transition-all duration-300 hover:scale-110
                   animate-pulse-slow border-2 border-primary-foreground/10"
        aria-label={t('chat.title')}
      >
        <MessageCircle className="h-7 w-7 text-primary-foreground" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[400px] h-[650px] 
                     bg-gradient-to-b from-background to-secondary/30
                     border-2 border-primary/20 rounded-2xl shadow-2xl 
                     flex flex-col z-50 
                     animate-in slide-in-from-bottom-4 zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary/10 
                      bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent 
                          flex items-center justify-center shadow-lg">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full 
                           border-2 border-background animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              {t('chat.title')}
            </h3>
            <p className="text-xs text-muted-foreground">Online • Resposta rápida</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-full hover:bg-primary/10"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-full hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <>
              <div className="flex justify-start animate-message-in">
                <div className="chat-bubble-assistant">
                  <p className="text-sm text-foreground">{t('chat.greeting')}</p>
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
                    className="chat-suggestion-button w-full text-left flex items-center gap-2"
                  >
                    <span className="text-lg">{suggestion.icon}</span>
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
                <p className={`text-sm whitespace-pre-wrap ${
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
      <div className="p-4 border-t border-primary/10 bg-gradient-to-r from-primary/5 via-background to-accent/5">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('chat.placeholder')}
            disabled={isLoading}
            className="chat-input-field flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90
                     transition-all duration-200 shadow-md hover:shadow-lg rounded-xl h-10 w-10 p-0"
          >
            <Send className="h-4 w-4 text-primary-foreground" />
          </Button>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
          >
            Limpar histórico
          </button>
        )}
      </div>
    </Card>
  );
};

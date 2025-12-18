import { useState } from 'react';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MultilingualTabs } from '@/components/admin/MultilingualTabs';
import { DateTimePicker } from '@/components/admin/DateTimePicker';
import { TagsInput } from '@/components/admin/TagsInput';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['link', 'image'],
    [{ color: [] }, { background: [] }],
    ['clean'],
  ],
};

export default function NewCampaign() {
  const [currentStep, setCurrentStep] = useState(1);
  const [internalName, setInternalName] = useState('');
  const [subject, setSubject] = useState({ pt: '', fr: '', en: '', de: '' });
  const [content, setContent] = useState({ pt: '', fr: '', en: '', de: '' });
  const [segmentType, setSegmentType] = useState('all');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['pt', 'fr', 'en', 'de']);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sendOption, setSendOption] = useState('now');
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [confirmed, setConfirmed] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query para contar destinatários
  const { data: audienceCount } = useQuery({
    queryKey: ['audience-count', segmentType, selectedLanguages, selectedTags],
    queryFn: async () => {
      let query = supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (segmentType === 'language') {
        query = query.in('language', selectedLanguages);
      }
      if (segmentType === 'tags' && selectedTags.length > 0) {
        query = query.contains('tags', selectedTags);
      }

      const { count } = await query;
      return count || 0;
    },
  });

  // Mutation para criar/agendar campanha
  const createCampaignMutation = useMutation({
    mutationFn: async () => {
      let scheduledAt = null;
      if (sendOption === 'schedule') {
        const scheduleDateTime = new Date(scheduledDate);
        const [hours, minutes] = scheduledTime.split(':');
        scheduleDateTime.setHours(parseInt(hours), parseInt(minutes));
        scheduledAt = scheduleDateTime.toISOString();
      }

      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .insert([
          {
            subject,
            content,
            status: sendOption === 'schedule' ? 'scheduled' : 'draft',
            scheduled_at: scheduledAt,
            total_recipients: audienceCount || 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Se for enviar agora, chamar Edge Function
      if (sendOption === 'now') {
        const { error: sendError } = await supabase.functions.invoke('send-newsletter', {
          body: { campaignId: data.id }
        });
        if (sendError) throw sendError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-campaigns'] });
      toast.success(sendOption === 'now' ? 'Newsletter enviada com sucesso!' : 'Campanha agendada com sucesso');
      navigate('/admin/newsletter');
    },
    onError: () => {
      toast.error('Erro ao processar campanha');
    },
  });

  const handleNext = () => {
    if (currentStep === 1) {
      if (!subject.pt || !subject.fr || !subject.en || !subject.de) {
        toast.error('Preencha o assunto em todos os idiomas');
        return;
      }
    }
    if (currentStep === 2) {
      if (!content.pt || !content.fr || !content.en || !content.de) {
        toast.error('Preencha o conteúdo em todos os idiomas');
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSend = () => {
    if (!confirmed) {
      toast.error('Por favor, confirme que revisou o conteúdo');
      return;
    }
    createCampaignMutation.mutate();
  };

  const steps = [
    { number: 1, title: 'Informações Básicas' },
    { number: 2, title: 'Conteúdo' },
    { number: 3, title: 'Preview' },
    { number: 4, title: 'Envio' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/newsletter')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Nova Campanha</h1>
              <p className="text-muted-foreground">Crie uma nova campanha de newsletter</p>
            </div>
          </div>
        </div>

        {/* Steps Progress */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground text-muted-foreground'
                }`}
              >
                {step.number}
              </div>
              <div className="ml-2">
                <p
                  className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-20 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Informações Básicas */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Nome Interno da Campanha</Label>
                <Input
                  placeholder="Ex: Newsletter Novembro 2024"
                  value={internalName}
                  onChange={(e) => setInternalName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Assunto (Multilíngue) *</Label>
                <MultilingualTabs
                  value={subject}
                  onChange={(value, lang) => setSubject({ ...subject, [lang]: value })}
                  type="input"
                  label="Assunto"
                  required
                />
              </div>

              <div className="space-y-4">
                <Label>Segmentação</Label>
                <RadioGroup value={segmentType} onValueChange={setSegmentType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="font-normal cursor-pointer">
                      Todos os subscritores ativos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="language" id="language" />
                    <Label htmlFor="language" className="font-normal cursor-pointer">
                      Filtrar por idioma
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tags" id="tags" />
                    <Label htmlFor="tags" className="font-normal cursor-pointer">
                      Filtrar por tags
                    </Label>
                  </div>
                </RadioGroup>

                {segmentType === 'language' && (
                  <div className="ml-6 space-y-2">
                    {['pt', 'fr', 'en', 'de'].map((lang) => (
                      <div key={lang} className="flex items-center space-x-2">
                        <Checkbox
                          id={lang}
                          checked={selectedLanguages.includes(lang)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLanguages([...selectedLanguages, lang]);
                            } else {
                              setSelectedLanguages(
                                selectedLanguages.filter((l) => l !== lang)
                              );
                            }
                          }}
                        />
                        <Label htmlFor={lang} className="font-normal cursor-pointer">
                          {
                            { pt: 'Português', fr: 'Français', en: 'English', de: 'Deutsch' }[
                              lang
                            ]
                          }
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                {segmentType === 'tags' && (
                  <div className="ml-6">
                    <TagsInput value={selectedTags} onChange={setSelectedTags} />
                  </div>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Preview da Audiência</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{audienceCount || 0}</p>
                  <p className="text-sm text-muted-foreground">destinatários serão alcançados</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Conteúdo */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo da Newsletter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Variáveis disponíveis:</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                      <code className="bg-background px-1 py-0.5 rounded">{'{{nome}}'}</code> - Nome
                      do subscritor
                    </p>
                    <p>
                      <code className="bg-background px-1 py-0.5 rounded">{'{{email}}'}</code> -
                      Email do subscritor
                    </p>
                    <p>
                      <code className="bg-background px-1 py-0.5 rounded">
                        {'{{unsubscribe_link}}'}
                      </code>{' '}
                      - Link para cancelar subscrição
                    </p>
                  </div>
                </div>

                <Tabs defaultValue="pt" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="pt">Português</TabsTrigger>
                    <TabsTrigger value="fr">Français</TabsTrigger>
                    <TabsTrigger value="en">English</TabsTrigger>
                    <TabsTrigger value="de">Deutsch</TabsTrigger>
                  </TabsList>

                  {['pt', 'fr', 'en', 'de'].map((lang) => (
                    <TabsContent key={lang} value={lang} className="mt-4">
                      <ReactQuill
                        theme="snow"
                        value={content[lang as keyof typeof content]}
                        onChange={(value) => setContent({ ...content, [lang]: value })}
                        modules={quillModules}
                        placeholder="Digite o conteúdo da newsletter..."
                        style={{ height: '400px', marginBottom: '50px' }}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Preview */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Preview da Campanha</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pt" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="pt">Português</TabsTrigger>
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="de">Deutsch</TabsTrigger>
                </TabsList>

                {['pt', 'fr', 'en', 'de'].map((lang) => (
                  <TabsContent key={lang} value={lang} className="space-y-4">
                    <div className="border rounded-lg p-6 bg-background">
                      <h2 className="text-2xl font-bold mb-4">
                        {subject[lang as keyof typeof subject]}
                      </h2>
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(content[lang as keyof typeof content], {
                            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'a', 'img', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'span', 'div'],
                            ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target'],
                          }),
                        }}
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Envio */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Opções de Envio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={sendOption} onValueChange={setSendOption}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="now" id="now" />
                  <Label htmlFor="now" className="font-normal cursor-pointer">
                    Enviar agora
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="schedule" id="schedule" />
                  <Label htmlFor="schedule" className="font-normal cursor-pointer">
                    Agendar envio
                  </Label>
                </div>
              </RadioGroup>

              {sendOption === 'schedule' && (
                <div className="ml-6">
                  <DateTimePicker
                    date={scheduledDate}
                    time={scheduledTime}
                    onDateChange={setScheduledDate}
                    onTimeChange={setScheduledTime}
                  />
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Estatísticas Previstas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total de destinatários:</span>
                    <span className="font-semibold">{audienceCount || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center space-x-2">
                <Checkbox id="confirm" checked={confirmed} onCheckedChange={(checked) => setConfirmed(checked as boolean)} />
                <Label htmlFor="confirm" className="font-normal cursor-pointer">
                  Confirmo que revisei o conteúdo da campanha
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          {currentStep < 4 ? (
            <Button onClick={handleNext}>
              Próximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSend} disabled={!confirmed || createCampaignMutation.isPending}>
              <Send className="mr-2 h-4 w-4" />
              {sendOption === 'now' ? 'Enviar Newsletter' : 'Agendar Envio'}
            </Button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

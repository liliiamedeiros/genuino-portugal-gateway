import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultilingualInput } from '@/components/admin/MultilingualInput';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconSelector } from '@/components/admin/IconSelector';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

export default function AboutSettings() {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    hero: {
      title: { fr: '', en: '', de: '', pt: '' },
      subtitle: { fr: '', en: '', de: '', pt: '' },
    },
    mission: {
      title: { fr: '', en: '', de: '', pt: '' },
      text1: { fr: '', en: '', de: '', pt: '' },
      text2: { fr: '', en: '', de: '', pt: '' },
      text3: { fr: '', en: '', de: '', pt: '' },
    },
    approach: {
      title: { fr: '', en: '', de: '', pt: '' },
      text1: { fr: '', en: '', de: '', pt: '' },
      text2: { fr: '', en: '', de: '', pt: '' },
    },
    values: [
      { number: 1, title: { fr: '', en: '', de: '', pt: '' }, description: { fr: '', en: '', de: '', pt: '' } },
      { number: 2, title: { fr: '', en: '', de: '', pt: '' }, description: { fr: '', en: '', de: '', pt: '' } },
      { number: 3, title: { fr: '', en: '', de: '', pt: '' }, description: { fr: '', en: '', de: '', pt: '' } },
    ],
  });

  const [statistics, setStatistics] = useState([
    { key: 'years', value: 10, label: { fr: '', en: '', de: '', pt: '' }, icon: 'Calendar' },
    { key: 'projects', value: 12, label: { fr: '', en: '', de: '', pt: '' }, icon: 'Building2' },
    { key: 'volume', value: 30, label: { fr: '', en: '', de: '', pt: '' }, icon: 'TrendingUp' },
  ]);

  const { data: sections } = useQuery({
    queryKey: ['page-sections', 'about'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_name', 'about');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['statistics', 'about'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('statistics')
        .select('*')
        .in('key', ['years', 'projects', 'volume'])
        .order('order_index');
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (sections && sections.length > 0) {
      sections.forEach(section => {
        const content = section.content as any;
        
        if (section.section_key === 'hero') {
          setFormData(prev => ({ ...prev, hero: content }));
        } else if (section.section_key === 'mission') {
          setFormData(prev => ({ ...prev, mission: content }));
        } else if (section.section_key === 'approach') {
          setFormData(prev => ({ ...prev, approach: content }));
        } else if (section.section_key === 'values') {
          setFormData(prev => ({ ...prev, values: content }));
        }
      });
    }
  }, [sections]);

  useEffect(() => {
    if (stats && stats.length > 0) {
      setStatistics(stats.map(stat => ({
        key: stat.key,
        value: stat.value,
        label: stat.label as any,
        icon: stat.icon_name,
      })));
    }
  }, [stats]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Upsert hero
      await supabase.from('page_sections').upsert({
        page_name: 'about',
        section_key: 'hero',
        content: formData.hero,
        is_active: true,
      }, { onConflict: 'page_name,section_key' });

      // Upsert mission
      await supabase.from('page_sections').upsert({
        page_name: 'about',
        section_key: 'mission',
        content: formData.mission,
        is_active: true,
      }, { onConflict: 'page_name,section_key' });

      // Upsert approach
      await supabase.from('page_sections').upsert({
        page_name: 'about',
        section_key: 'approach',
        content: formData.approach,
        is_active: true,
      }, { onConflict: 'page_name,section_key' });

      // Upsert values
      await supabase.from('page_sections').upsert({
        page_name: 'about',
        section_key: 'values',
        content: formData.values,
        is_active: true,
      }, { onConflict: 'page_name,section_key' });

      // Upsert statistics
      for (const stat of statistics) {
        await supabase.from('statistics').upsert({
          key: stat.key,
          value: stat.value,
          label: stat.label,
          icon_name: stat.icon,
          is_active: true,
        }, { onConflict: 'key' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-sections', 'about'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('Configurações salvas com sucesso!');
    },
  });

  return (
    <AdminLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Configurações - Sobre</h1>
          <p className="text-muted-foreground">Configure o conteúdo da página Sobre</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MultilingualInput
              label="Título"
              value={formData.hero.title}
              onChange={(val) => setFormData({ ...formData, hero: { ...formData.hero, title: val } })}
            />
            <MultilingualInput
              label="Subtítulo"
              value={formData.hero.subtitle}
              onChange={(val) => setFormData({ ...formData, hero: { ...formData.hero, subtitle: val } })}
              type="textarea"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nossa Missão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MultilingualInput
              label="Título"
              value={formData.mission.title}
              onChange={(val) => setFormData({ ...formData, mission: { ...formData.mission, title: val } })}
            />
            <MultilingualInput
              label="Parágrafo 1"
              value={formData.mission.text1}
              onChange={(val) => setFormData({ ...formData, mission: { ...formData.mission, text1: val } })}
              type="textarea"
            />
            <MultilingualInput
              label="Parágrafo 2"
              value={formData.mission.text2}
              onChange={(val) => setFormData({ ...formData, mission: { ...formData.mission, text2: val } })}
              type="textarea"
            />
            <MultilingualInput
              label="Parágrafo 3"
              value={formData.mission.text3}
              onChange={(val) => setFormData({ ...formData, mission: { ...formData.mission, text3: val } })}
              type="textarea"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {statistics.map((stat, index) => (
              <div key={stat.key} className="p-4 border rounded space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      value={stat.value}
                      onChange={(e) => {
                        const newStats = [...statistics];
                        newStats[index].value = parseInt(e.target.value);
                        setStatistics(newStats);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Ícone</Label>
                    <IconSelector
                      value={stat.icon}
                      onChange={(val) => {
                        const newStats = [...statistics];
                        newStats[index].icon = val;
                        setStatistics(newStats);
                      }}
                    />
                  </div>
                </div>
                <MultilingualInput
                  label="Label"
                  value={stat.label}
                  onChange={(val) => {
                    const newStats = [...statistics];
                    newStats[index].label = val;
                    setStatistics(newStats);
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nossa Abordagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MultilingualInput
              label="Título"
              value={formData.approach.title}
              onChange={(val) => setFormData({ ...formData, approach: { ...formData.approach, title: val } })}
            />
            <MultilingualInput
              label="Parágrafo 1"
              value={formData.approach.text1}
              onChange={(val) => setFormData({ ...formData, approach: { ...formData.approach, text1: val } })}
              type="textarea"
            />
            <MultilingualInput
              label="Parágrafo 2"
              value={formData.approach.text2}
              onChange={(val) => setFormData({ ...formData, approach: { ...formData.approach, text2: val } })}
              type="textarea"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nossos Valores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.values.map((value, index) => (
              <div key={index} className="p-4 border rounded space-y-4">
                <h4 className="font-semibold">Valor {value.number}</h4>
                <MultilingualInput
                  label="Título"
                  value={value.title}
                  onChange={(val) => {
                    const newValues = [...formData.values];
                    newValues[index].title = val;
                    setFormData({ ...formData, values: newValues });
                  }}
                />
                <MultilingualInput
                  label="Descrição"
                  value={value.description}
                  onChange={(val) => {
                    const newValues = [...formData.values];
                    newValues[index].description = val;
                    setFormData({ ...formData, values: newValues });
                  }}
                  type="textarea"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bug, X, Eye } from 'lucide-react';
import { FALLBACK_MAIN_MENU, resolveLabel } from '@/data/navigationFallback';

/**
 * Floating debug overlay that shows the current Tailwind breakpoint, viewport
 * size, and the menu items currently rendered in the navbar.
 *
 * Activation:
 *  - Add ?debug=1 to any URL, OR press Ctrl+Shift+D
 *  - State persists across the session in sessionStorage
 */

const TW_BREAKPOINTS: { name: string; min: number }[] = [
  { name: 'xs',  min: 320  },
  { name: 'sm',  min: 640  },
  { name: 'md',  min: 768  },
  { name: 'lg',  min: 1024 },
  { name: 'xl',  min: 1280 },
  { name: '2xl', min: 1536 },
  { name: '3xl', min: 1920 },
  { name: '4xl', min: 2560 },
];

function currentBreakpoint(width: number): string {
  let active = 'xs';
  for (const b of TW_BREAKPOINTS) {
    if (width >= b.min) active = b.name;
  }
  return active;
}

export const ResponsiveDebugPanel = () => {
  const { language } = useLanguage();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(true);
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [height, setHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 0);
  const [menuSource, setMenuSource] = useState<'live' | 'fallback'>('fallback');

  // Activate via ?debug=1 or Ctrl+Shift+D
  useEffect(() => {
    const persisted = sessionStorage.getItem('genuino:debug') === '1';
    const queryFlag = new URLSearchParams(window.location.search).get('debug') === '1';
    if (persisted || queryFlag) setEnabled(true);
    if (queryFlag) sessionStorage.setItem('genuino:debug', '1');

    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setEnabled(prev => {
          const next = !prev;
          sessionStorage.setItem('genuino:debug', next ? '1' : '0');
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Resize listener
  useEffect(() => {
    if (!enabled) return;
    const onResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [enabled]);

  // Mirror the same query the Navbar uses so we can show what's rendered
  const { data: liveItems } = useQuery({
    queryKey: ['debug-navigation-menus', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('navigation_menus')
        .select('path,label,is_active,order_index')
        .eq('menu_type', 'main')
        .eq('is_active', true)
        .order('order_index');
      if (error || !data || data.length === 0) {
        setMenuSource('fallback');
        return null;
      }
      setMenuSource('live');
      return data.map(d => ({
        to: d.path,
        label: (d.label as Record<string, string>)?.[language] || (d.label as Record<string, string>)?.pt || '',
      }));
    },
    enabled,
    staleTime: 30_000,
  });

  const items = liveItems ?? FALLBACK_MAIN_MENU.map(i => ({ to: i.path, label: resolveLabel(i, language) }));
  const bp = currentBreakpoint(width);
  const isLgUp = width >= 1024;

  if (!enabled) return null;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-[9999] bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
        aria-label="Open debug panel"
      >
        <Bug className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-4 left-4 z-[9999] w-[320px] max-w-[calc(100vw-2rem)] bg-background border border-border rounded-lg shadow-2xl text-xs font-mono"
      style={{ backdropFilter: 'blur(8px)' }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted rounded-t-lg">
        <div className="flex items-center gap-2 font-semibold">
          <Bug className="w-4 h-4" />
          <span>Responsive Debug</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setEnabled(false);
              sessionStorage.setItem('genuino:debug', '0');
            }}
            className="text-muted-foreground hover:text-foreground p-1"
            title="Disable (Ctrl+Shift+D)"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground p-1" title="Minimize">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Viewport */}
        <div>
          <div className="text-muted-foreground mb-1">Viewport</div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary">{width} × {height}px</span>
            <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground font-bold uppercase">{bp}</span>
          </div>
        </div>

        {/* Breakpoints chain */}
        <div>
          <div className="text-muted-foreground mb-1">Tailwind breakpoints</div>
          <div className="flex flex-wrap gap-1">
            {TW_BREAKPOINTS.map(b => {
              const active = width >= b.min;
              return (
                <span
                  key={b.name}
                  className={`px-1.5 py-0.5 rounded border ${
                    active ? 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-300' : 'bg-muted border-border text-muted-foreground'
                  }`}
                  title={`min-width: ${b.min}px`}
                >
                  {b.name}
                </span>
              );
            })}
          </div>
        </div>

        {/* Menu state */}
        <div>
          <div className="text-muted-foreground mb-1 flex items-center justify-between">
            <span>Menu items rendering ({items.length})</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
              menuSource === 'live'
                ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                : 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'
            }`}>
              {menuSource === 'live' ? 'LIVE DB' : 'FALLBACK'}
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground mb-1">
            Mode: <b>{isLgUp ? 'Desktop bar' : 'Mobile drawer'}</b> · Lang: <b className="uppercase">{language}</b>
          </div>
          <ul className="space-y-0.5 max-h-40 overflow-auto">
            {items.map(it => (
              <li key={it.to} className="flex items-center justify-between gap-2">
                <span className="truncate">{it.label}</span>
                <code className="text-[10px] text-muted-foreground">{it.to}</code>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-[10px] text-muted-foreground border-t pt-2">
          Toggle: <kbd className="px-1 border rounded">Ctrl</kbd>+<kbd className="px-1 border rounded">Shift</kbd>+<kbd className="px-1 border rounded">D</kbd> · or <code>?debug=1</code>
        </div>
      </div>
    </div>
  );
};
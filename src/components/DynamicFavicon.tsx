import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Component that dynamically injects the favicon into the document head.
 * Fetches the favicon URL from system_settings and uses react-helmet-async
 * to override the static favicon after React loads.
 */
export const DynamicFavicon = () => {
  const { data: faviconUrl } = useQuery({
    queryKey: ['dynamic-favicon'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'favicon_url')
        .single();
      
      if (error || !data) return null;
      
      // The value is stored as JSON, so we need to extract the string
      const url = typeof data.value === 'string' ? data.value : data.value;
      return url as string | null;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Don't render anything if no custom favicon is set
  if (!faviconUrl) return null;

  // Determine MIME type based on file extension
  const getMimeType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'ico':
        return 'image/x-icon';
      case 'svg':
        return 'image/svg+xml';
      case 'png':
        return 'image/png';
      default:
        return 'image/png';
    }
  };

  const mimeType = getMimeType(faviconUrl);

  return (
    <Helmet>
      <link rel="icon" href={faviconUrl} type={mimeType} />
      <link rel="shortcut icon" href={faviconUrl} type={mimeType} />
    </Helmet>
  );
};

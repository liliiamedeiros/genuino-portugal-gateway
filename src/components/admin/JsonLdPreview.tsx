import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Home, Euro } from "lucide-react";

interface JsonLdPreviewProps {
  jsonLd: any;
}

export const JsonLdPreview = ({ jsonLd }: JsonLdPreviewProps) => {
  if (!jsonLd || typeof jsonLd !== 'object') {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">No JSON-LD data to preview</p>
      </Card>
    );
  }

  const title = jsonLd.name || 'Property Title';
  const description = jsonLd.description || '';
  const price = jsonLd.offers?.price;
  const currency = jsonLd.offers?.priceCurrency || 'EUR';
  const location = jsonLd.address?.addressLocality || '';
  const region = jsonLd.address?.addressRegion || '';
  const imageUrl = Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image;
  const type = jsonLd.additionalType || '';
  const category = jsonLd.category || '';

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Google Rich Results Preview</h3>
        <p className="text-xs text-muted-foreground mb-4">
          This is how your listing may appear in Google search results
        </p>
      </div>

      <Card className="p-4 bg-background">
        <div className="flex gap-4">
          {imageUrl && (
            <div className="flex-shrink-0">
              <img 
                src={imageUrl} 
                alt={title}
                className="w-24 h-24 object-cover rounded"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1">
              <h4 className="text-blue-600 hover:underline cursor-pointer text-lg font-normal line-clamp-1">
                {title}
              </h4>
            </div>
            
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <span className="text-green-700">
                {window.location.origin}/project/{jsonLd.url?.split('/').pop() || ''}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              {price && (
                <Badge variant="outline" className="gap-1">
                  <Euro className="h-3 w-3" />
                  {new Intl.NumberFormat('pt-PT', {
                    style: 'currency',
                    currency: currency,
                    minimumFractionDigits: 0
                  }).format(price)}
                </Badge>
              )}
              
              {type && (
                <Badge variant="secondary" className="gap-1">
                  <Home className="h-3 w-3" />
                  {type}
                </Badge>
              )}
              
              {category && (
                <Badge variant="secondary">
                  {category}
                </Badge>
              )}
              
              {(location || region) && (
                <Badge variant="outline" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {location}{region && location ? ', ' : ''}{region}
                </Badge>
              )}
            </div>

            {description && (
              <p className="text-sm text-foreground/80 line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

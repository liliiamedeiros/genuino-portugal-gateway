import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { validateJsonLd, parseJsonLd, formatJsonLd } from "@/utils/jsonLdUtils";
import { JsonLdPreview } from "@/components/admin/JsonLdPreview";
import { CheckCircle, AlertTriangle, XCircle, ExternalLink, Code } from "lucide-react";
import { toast } from "sonner";

const JsonLdValidator = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);

  const handleValidate = () => {
    const parseResult = parseJsonLd(jsonInput);
    
    if (!parseResult.success) {
      toast.error('JSON inválido', {
        description: parseResult.error
      });
      setValidationResult({
        valid: false,
        errors: [parseResult.error || 'Invalid JSON'],
        warnings: []
      });
      setParsedData(null);
      return;
    }

    const validation = validateJsonLd(parseResult.data);
    setValidationResult(validation);
    setParsedData(parseResult.data);

    if (validation.valid && validation.warnings.length === 0) {
      toast.success('JSON-LD válido!', {
        description: 'O JSON-LD está correto e pronto para uso.'
      });
    } else if (validation.valid) {
      toast.warning('JSON-LD válido com avisos', {
        description: `${validation.warnings.length} avisos encontrados`
      });
    } else {
      toast.error('JSON-LD inválido', {
        description: `${validation.errors.length} erros encontrados`
      });
    }
  };

  const handleFormat = () => {
    const parseResult = parseJsonLd(jsonInput);
    if (parseResult.success) {
      setJsonInput(formatJsonLd(parseResult.data));
      toast.success('JSON formatado com sucesso');
    } else {
      toast.error('Não foi possível formatar', {
        description: parseResult.error
      });
    }
  };

  const exampleJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": "Luxury Villa in Algarve",
    "description": "Beautiful 3-bedroom villa with sea view",
    "url": "https://capitalestate.pt/project/villa-algarve",
    "image": ["https://example.com/villa.jpg"],
    "offers": {
      "@type": "Offer",
      "price": 450000,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Algarve",
      "addressRegion": "Faro",
      "addressCountry": "PT"
    },
    "numberOfRooms": 3,
    "numberOfBathroomsTotal": 2
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Validador JSON-LD</h1>
          <p className="text-muted-foreground mt-2">
            Valide e teste seu JSON-LD para dados estruturados de imóveis
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Cole seu JSON-LD</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setJsonInput(formatJsonLd(exampleJsonLd))}
                  >
                    Usar Exemplo
                  </Button>
                </div>

                <Textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Cole seu código JSON-LD aqui..."
                  className="font-mono text-sm min-h-[400px]"
                />

                <div className="flex gap-2">
                  <Button onClick={handleValidate} className="flex-1">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Validar
                  </Button>
                  <Button variant="outline" onClick={handleFormat}>
                    <Code className="mr-2 h-4 w-4" />
                    Formatar
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Ferramentas de Teste Externas
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('https://search.google.com/test/rich-results', '_blank')}
                >
                  Google Rich Results Test
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('https://validator.schema.org/', '_blank')}
                >
                  Schema.org Validator
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            {validationResult && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Resultados da Validação</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {validationResult.valid ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-600">JSON-LD Válido</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-destructive" />
                        <span className="font-medium text-destructive">JSON-LD Inválido</span>
                      </>
                    )}
                  </div>

                  {validationResult.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-semibold mb-2">Erros ({validationResult.errors.length}):</div>
                        <ul className="list-disc list-inside space-y-1">
                          {validationResult.errors.map((error, idx) => (
                            <li key={idx} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {validationResult.warnings.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-semibold mb-2">Avisos ({validationResult.warnings.length}):</div>
                        <ul className="list-disc list-inside space-y-1">
                          {validationResult.warnings.map((warning, idx) => (
                            <li key={idx} className="text-sm">{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {validationResult.valid && validationResult.warnings.length === 0 && (
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Seu JSON-LD está perfeitamente válido e pronto para uso!
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </Card>
            )}

            {parsedData && (
              <Card className="p-6">
                <Tabs defaultValue="preview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="structure">Estrutura</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview">
                    <JsonLdPreview jsonLd={parsedData} />
                  </TabsContent>

                  <TabsContent value="structure">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">@type</Badge>
                        <span className="text-sm">{parsedData['@type']}</span>
                      </div>
                      
                      {parsedData.name && (
                        <div className="flex items-start gap-2">
                          <Badge variant="outline">name</Badge>
                          <span className="text-sm flex-1">{parsedData.name}</span>
                        </div>
                      )}
                      
                      {parsedData.offers && (
                        <div className="flex items-start gap-2">
                          <Badge variant="outline">offers</Badge>
                          <div className="text-sm flex-1">
                            <div>Price: {parsedData.offers.price} {parsedData.offers.priceCurrency}</div>
                          </div>
                        </div>
                      )}
                      
                      {parsedData.address && (
                        <div className="flex items-start gap-2">
                          <Badge variant="outline">address</Badge>
                          <div className="text-sm flex-1">
                            <div>{parsedData.address.addressLocality}, {parsedData.address.addressRegion}</div>
                            <div>{parsedData.address.addressCountry}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default JsonLdValidator;

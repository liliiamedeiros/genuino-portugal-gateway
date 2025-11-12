import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CSVImporterProps {
  onImport: (data: any[]) => Promise<void>;
  columns: { key: string; label: string; required?: boolean }[];
  triggerButton?: React.ReactNode;
}

export const CSVImporter = ({
  onImport,
  columns,
  triggerButton,
}: CSVImporterProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setResult(null);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setError('O arquivo CSV está vazio');
          return;
        }
        
        // Validate required columns
        const fileColumns = Object.keys(results.data[0] as object);
        const missingColumns = columns
          .filter(col => col.required)
          .filter(col => !fileColumns.includes(col.key));
        
        if (missingColumns.length > 0) {
          setError(
            `Colunas obrigatórias faltando: ${missingColumns.map(c => c.label).join(', ')}`
          );
          return;
        }

        setPreview(results.data.slice(0, 5));
      },
      error: (err) => {
        setError(`Erro ao ler arquivo: ${err.message}`);
      },
    });
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          await onImport(results.data as any[]);
          setResult({ success: results.data.length, errors: 0 });
          setTimeout(() => {
            setOpen(false);
            resetState();
          }, 2000);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erro ao importar dados');
        } finally {
          setImporting(false);
        }
      },
    });
  };

  const resetState = () => {
    setFile(null);
    setPreview([]);
    setError(null);
    setResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetState(); }}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importar CSV
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar dados via CSV</DialogTitle>
          <DialogDescription>
            Selecione um arquivo CSV com as seguintes colunas:{' '}
            {columns.map(c => `${c.label}${c.required ? '*' : ''}`).join(', ')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="csv-file">Arquivo CSV</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={importing}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Importação concluída! {result.success} registros importados com sucesso.
              </AlertDescription>
            </Alert>
          )}

          {preview.length > 0 && (
            <div>
              <Label>Preview (primeiros 5 registros)</Label>
              <div className="border rounded-md mt-2 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead key={col.key}>{col.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, idx) => (
                      <TableRow key={idx}>
                        {columns.map((col) => (
                          <TableCell key={col.key}>
                            {row[col.key] || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={importing}>
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || preview.length === 0 || importing || !!error}
          >
            {importing ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

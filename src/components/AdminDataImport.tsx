
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Upload, FileCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skin } from '@/types/skin';

const AdminDataImport = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<{
    total: number;
    imported: number;
    updated: number;
    failed: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setStats(null);
      setProgress(0);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a JSON file to import.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setImporting(true);
      setProgress(10);

      // Read the file
      const fileContent = await readFileAsText(selectedFile);
      setProgress(30);

      // Parse JSON
      let skinsData: Skin[];
      try {
        skinsData = JSON.parse(fileContent);
        if (!Array.isArray(skinsData)) {
          throw new Error('File content is not an array of skins');
        }
      } catch (error) {
        toast({
          title: 'Invalid JSON',
          description: 'The selected file does not contain valid JSON data.',
          variant: 'destructive',
        });
        setImporting(false);
        return;
      }

      setProgress(50);

      // Process stats for reporting
      const importStats = {
        total: skinsData.length,
        imported: 0,
        updated: 0,
        failed: 0,
      };

      // Process in batches to avoid overwhelming the database
      const batchSize = 50;
      const batches = Math.ceil(skinsData.length / batchSize);

      for (let i = 0; i < batches; i++) {
        const batchItems = skinsData.slice(i * batchSize, (i + 1) * batchSize);
        
        try {
          // For each item in the batch, insert or update based on name
          for (const skin of batchItems) {
            try {
              // Check if skin exists
              const { data: existingSkins, error: queryError } = await supabase
                .from('skins')
                .select('id, name')
                .eq('name', skin.name)
                .limit(1);

              if (queryError) throw queryError;

              if (existingSkins && existingSkins.length > 0) {
                // Update existing
                const { error: updateError } = await supabase
                  .from('skins')
                  .update({
                    weapon_type: skin.weapon_type,
                    image_url: skin.image_url,
                    rarity: skin.rarity,
                    exterior: skin.exterior,
                    price_usd: skin.price_usd,
                    // Add other fields as needed
                  })
                  .eq('id', existingSkins[0].id);

                if (updateError) throw updateError;
                importStats.updated++;
              } else {
                // Insert new
                const { error: insertError } = await supabase
                  .from('skins')
                  .insert({
                    name: skin.name,
                    weapon_type: skin.weapon_type,
                    image_url: skin.image_url,
                    rarity: skin.rarity as string,
                    exterior: skin.exterior,
                    price_usd: skin.price_usd,
                    // Add other fields as needed
                  });

                if (insertError) throw insertError;
                importStats.imported++;
              }
            } catch (error) {
              console.error('Failed to process skin:', skin.name, error);
              importStats.failed++;
            }
          }
        } catch (error) {
          console.error('Batch processing error:', error);
        }

        // Update progress after each batch
        setProgress(50 + Math.round(((i + 1) / batches) * 50));
      }

      setStats(importStats);
      toast({
        title: 'Import complete',
        description: `Imported ${importStats.imported} new skins, updated ${importStats.updated} existing skins.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: 'There was an error importing the data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
      setProgress(100);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => {
        reader.abort();
        reject(new Error('File read error'));
      };
      reader.readAsText(file);
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Import Skins Data</h3>
          <p className="text-sm text-muted-foreground">
            Upload a JSON file containing skin data to update the inventory database.
            The file should contain an array of skin objects.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            disabled={importing}
            className="max-w-sm"
          />
          <Button 
            onClick={handleImport}
            disabled={!selectedFile || importing}
          >
            {importing ? (
              <>Processing...</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </>
            )}
          </Button>
        </div>
        
        {importing && (
          <div className="space-y-2">
            <p className="text-sm">Importing data... Please wait.</p>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {stats && (
          <Alert>
            <FileCheck className="h-4 w-4" />
            <AlertTitle>Import Complete</AlertTitle>
            <AlertDescription>
              <div className="mt-2 text-sm">
                <p className="mb-1">Total items: {stats.total}</p>
                <p className="mb-1 text-green-600">Added: {stats.imported}</p>
                <p className="mb-1 text-blue-600">Updated: {stats.updated}</p>
                {stats.failed > 0 && (
                  <p className="mb-1 text-red-600">Failed: {stats.failed}</p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <Card className="p-4 border-dashed">
        <h4 className="text-sm font-medium mb-2">Expected JSON Format</h4>
        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
{`[
  {
    "name": "AK-47 | Asiimov",
    "weapon_type": "Rifle",
    "image_url": "https://example.com/image.png",
    "rarity": "legendary",
    "exterior": "Factory New",
    "price_usd": 120.5
  },
  // More items...
]`}
        </pre>
      </Card>
    </div>
  );
};

export default AdminDataImport;

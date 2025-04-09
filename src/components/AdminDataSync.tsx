
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { refreshSkinsCache } from '@/utils/skinCache';

const AdminDataSync = () => {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Function to sync data with source API
  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus('idle');
      setProgress(10);

      // Simulate data synchronization with progress updates
      // In production, this would be replaced with actual API calls
      await new Promise(r => setTimeout(r, 1000));
      setProgress(30);

      // Call the skin cache refresh function
      await refreshSkinsCache(
        // Progress callback function
        (progress) => {
          setProgress(30 + Math.floor(progress * 60));
        }
      );

      setProgress(100);
      setSyncStatus('success');
      setLastSyncTime(new Date());
      
      toast({
        title: "Sync Complete",
        description: "Inventory data has been synchronized successfully.",
      });
    } catch (error) {
      console.error("Sync error:", error);
      setSyncStatus('error');
      
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize inventory data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Synchronize Inventory Data</h3>
        <p className="text-sm text-muted-foreground">
          Synchronize the local inventory data with external sources and APIs.
          This process will refresh prices, add new items, and update existing ones.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button 
          onClick={handleSync} 
          disabled={isSyncing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Synchronizing..." : "Sync Data Now"}
        </Button>
        
        {lastSyncTime && (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Last sync: {lastSyncTime.toLocaleString()}
          </span>
        )}
      </div>

      {isSyncing && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Synchronizing data... This may take a few minutes.
          </p>
        </div>
      )}

      {syncStatus === 'success' && !isSyncing && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span>Synchronization completed successfully</span>
        </div>
      )}

      {syncStatus === 'error' && !isSyncing && (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>Synchronization failed. Please try again.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h4 className="font-medium">Manual Data Update</h4>
              <p className="text-sm text-muted-foreground">
                Update inventory data manually by uploading JSON files.
              </p>
              <Button variant="outline" onClick={() => window.location.href = '#import'}>
                Go to Import Tab
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h4 className="font-medium">Scheduled Sync</h4>
              <p className="text-sm text-muted-foreground">
                Configure automatic synchronization schedule (coming soon).
              </p>
              <Button variant="outline" disabled>
                Configure Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDataSync;


import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const ApiTest = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const testApi = async () => {
      try {
        setLoading(true);
        const steamId = "76561197960435530"; // Test Steam ID
        
        console.log(`Testing Steam API endpoint with ID: ${steamId}`);
        const res = await fetch(`/api/steam-login?steamid=${steamId}`);
        
        if (!res.ok) {
          throw new Error(`API responded with status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("API Response:", data);
        setResult(data);
      } catch (err) {
        console.error("API Test Error:", err);
        setError(err.message || "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    testApi();
  }, []);
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Testando API...</span>
        </div>
      ) : error ? (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h2 className="font-medium text-red-700 mb-2">Erro no teste da API</h2>
          <p className="text-red-600">{error}</p>
        </div>
      ) : result ? (
        <div className="space-y-4">
          <div className="p-4 border border-green-300 bg-green-50 rounded-md">
            <h2 className="font-medium text-green-700 mb-2">API funcionando!</h2>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Detalhes do usuário Steam:</h3>
            
            <div className="flex items-center mb-6">
              {result.avatarfull && (
                <img 
                  src={result.avatarfull} 
                  alt="Steam Avatar" 
                  className="w-16 h-16 rounded-md mr-4" 
                />
              )}
              <div>
                <p className="font-bold text-lg">{result.personaname || "N/A"}</p>
                <p className="text-sm text-gray-500">SteamID: {result.steamid || "N/A"}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Resposta completa da API:</h4>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md">
          <p>Nenhum resultado retornado.</p>
        </div>
      )}
    </div>
  );
};

export default ApiTest;

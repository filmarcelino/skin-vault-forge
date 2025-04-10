
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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
      <h1 className="text-3xl font-bold mb-6 text-neon-purple">API Test Page</h1>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2 text-neon-purple" />
          <span>Testando API...</span>
        </div>
      ) : error ? (
        <div className="p-6 border border-red-300 bg-red-950/10 rounded-md">
          <h2 className="font-medium text-red-500 mb-2 text-xl">Erro no teste da API</h2>
          <p className="text-red-400">{error}</p>
          <div className="mt-4">
            <Link to="/login">
              <Button variant="outline" className="text-white bg-red-950/20 border-red-500/30 hover:bg-red-950/40">
                Voltar para login
              </Button>
            </Link>
          </div>
        </div>
      ) : result ? (
        <div className="space-y-6">
          <div className="p-6 border border-neon-purple/30 bg-neon-purple/5 rounded-md shadow-lg backdrop-blur-sm">
            <h2 className="font-medium text-neon-purple mb-2 text-xl">API funcionando!</h2>
            <p className="text-gray-300">O endpoint Steam API está funcionando corretamente.</p>
          </div>
          
          <div className="bg-black/40 border border-white/10 shadow-xl rounded-lg p-8 backdrop-blur-sm">
            <h3 className="text-xl font-medium mb-6 text-white">Detalhes do usuário Steam:</h3>
            
            <div className="flex items-center mb-8">
              {result.avatarfull && (
                <img 
                  src={result.avatarfull} 
                  alt="Steam Avatar" 
                  className="w-20 h-20 rounded-md mr-6 border-2 border-neon-purple/30" 
                />
              )}
              <div>
                <p className="font-bold text-2xl text-white">{result.personaname || "N/A"}</p>
                <p className="text-sm text-gray-400">SteamID: {result.steamid || "N/A"}</p>
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium mb-3 text-gray-300">Resposta completa da API:</h4>
              <pre className="bg-black/50 p-4 rounded-md overflow-auto text-xs text-gray-300 border border-white/10">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Link to="/login">
                <Button variant="outline" className="border-neon-purple/30 hover:bg-neon-purple/10">
                  Ir para Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 border border-yellow-300 bg-yellow-950/10 rounded-md">
          <p>Nenhum resultado retornado.</p>
          <div className="mt-4">
            <Link to="/login">
              <Button variant="outline" className="text-white bg-yellow-950/20 border-yellow-500/30 hover:bg-yellow-950/40">
                Voltar para login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTest;

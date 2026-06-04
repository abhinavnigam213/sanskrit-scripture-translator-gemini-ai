import React, { useState } from 'react';
import { Terminal, Copy, Check, Play, FileCode, Server } from 'lucide-react';

interface ApiPlaygroundProps {
  currentText: string;
}

export default function ApiPlayground({ currentText }: ApiPlaygroundProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'/api/translate' | '/api/transliterate' | '/api/analyze' | '/api/scriptures'>('/api/translate');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'docs' | 'tester'>('docs');
  const [selectedLang, setSelectedLang] = useState<'curl' | 'js' | 'python'>('curl');
  
  // Interactive Tester State
  const [reqBody, setReqBody] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Default Request Templates
  const defaultBodies = {
    '/api/translate': JSON.stringify({
      text: currentText || "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
      sourceLang: "sanskrit",
      targetLang: "english",
      scriptureContext: "Bhagavad Gita"
    }, null, 2),
    '/api/transliterate': JSON.stringify({
      text: currentText || "ॐ भूर् भुवः स्वः।",
      sourceScript: "devanagari",
      targetScript: "iast"
    }, null, 2),
    '/api/analyze': JSON.stringify({
      text: currentText || "त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।",
      sourceContext: "Rigveda"
    }, null, 2),
    '/api/scriptures': ''
  };

  // Sync request body when endpoint changes
  React.useEffect(() => {
    setReqBody(defaultBodies[selectedEndpoint] || '');
  }, [selectedEndpoint, currentText]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getCodeSnippet = (lang: 'curl' | 'js' | 'python', endpoint: string, bodyStr: string) => {
    const host = window.location.origin;
    const isGet = endpoint === '/api/scriptures';
    let bodyObj = null;
    if (!isGet) {
      try {
        bodyObj = JSON.parse(bodyStr || '{}');
      } catch (e) {
        bodyObj = {};
      }
    }

    if (lang === 'curl') {
      if (isGet) {
        return `curl -X GET "${host}${endpoint}"`;
      }
      return `curl -X POST "${host}${endpoint}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(bodyObj)}'`;
    } else if (lang === 'js') {
      if (isGet) {
        return `fetch("${host}${endpoint}")
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`;
      }
      return `fetch("${host}${endpoint}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(${JSON.stringify(bodyObj, null, 2).replace(/\n/g, '\n  ')})
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`;
    } else if (lang === 'python') {
      if (isGet) {
        return `import requests

url = "${host}${endpoint}"

response = requests.get(url)
data = response.json()
print(data)`;
      }
      return `import requests

url = "${host}${endpoint}"
payload = ${JSON.stringify(bodyObj, null, 4)}

response = requests.post(url, json=payload)
data = response.json()
print(data)`;
    }
    return '';
  };

  const handleTestApi = async () => {
    setIsLoading(true);
    setApiError(null);
    setApiResponse('');
    try {
      const isGet = selectedEndpoint === '/api/scriptures';
      let options: RequestInit = {
        method: isGet ? "GET" : "POST",
        headers: {}
      };

      if (!isGet) {
        // Validate JSON input
        let parsed;
        try {
          parsed = JSON.parse(reqBody);
        } catch (jsonErr) {
          throw new Error("Invalid input format. Please check your JSON syntax.");
        }
        options.headers = {
          "Content-Type": "application/json"
        };
        options.body = JSON.stringify(parsed);
      }

      const res = await fetch(selectedEndpoint, options);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error((data && data.error) ? data.error : `HTTP error! Status: ${res.status}`);
      }

      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setApiError(err.message || 'Failed to complete API request.');
    } finally {
      setIsLoading(false);
    }
  };

  const endpointBriefs = {
    '/api/scriptures': {
      desc: 'Retrieves a list of popular, pre-configured classical Sanskrit scriptures, verses, categories, and translation defaults.',
      method: 'GET'
    },
    '/api/translate': {
      desc: 'Translates verses or prose. Perfect for extracting spiritual and context-aware meanings from ancient Sanskrit terms.',
      method: 'POST'
    },
    '/api/transliterate': {
      desc: 'Transliterates characters phonetically without converting semantic meaning (highly accurate IAST, ITRANS, or phonetic formats).',
      method: 'POST'
    },
    '/api/analyze': {
      desc: 'Performs word-by-word sandhi breakdown (Padapatha), detects poetic meters (Chandas), and identifies holy sources.',
      method: 'POST'
    }
  };

  return (
    <div id="dev-api-playground" className="p-1 max-w-full">
      {/* Endpoint Bar picker */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-[#F9F7F2] p-4 rounded-xl border border-[#E6E2D3] mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#D97706]/10 border border-[#D97706]/20 text-[#D97706] rounded-md">
              <Server className="w-4 h-4" />
            </span>
            <h3 className="font-serif text-lg font-bold text-[#1C1917]">Scriptural API Specifications</h3>
          </div>
          <p className="text-xs text-[#57534E] mt-1 max-w-xl">
            Integrate Vedic translations directly into your applications. All endpoints authenticate with your workspace token automatically.
          </p>
        </div>

        {/* Tab selector Docs vs Tester */}
        <div className="flex p-0.5 bg-[#F5F5F4] rounded-lg border border-[#E6E2D3] self-stretch lg:self-auto">
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer ${activeTab === 'docs' ? 'bg-white text-[#1C1917] font-bold border border-[#E6E2D3] shadow-sm' : 'text-[#57534E] hover:text-[#D97706]'}`}
          >
            Documentation & Examples
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer ${activeTab === 'tester' ? 'bg-white text-[#1C1917] font-bold border border-[#E6E2D3] shadow-sm' : 'text-[#57534E] hover:text-[#D97706]'}`}
          >
            Interactive Sandbox
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left endpoint selector Column */}
        <div className="md:col-span-4 space-y-3">
          <label className="text-xs font-mono tracking-wider text-[#78716C] uppercase font-bold">Interactive APIs</label>
          {Object.entries(endpointBriefs).map(([path, details]) => {
            const isSelected = selectedEndpoint === path;
            return (
              <button
                key={path}
                onClick={() => setSelectedEndpoint(path as any)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${isSelected ? 'bg-[#F9F7F2] border-[#D97706] shadow-sm' : 'bg-white border-[#E6E2D3] hover:border-[#D97706]/40 hover:bg-[#FDFBF7]'}`}
              >
                <div className="flex gap-2 items-center">
                  <span className={`px-1.5 py-0.5 border text-[10px] font-mono font-bold rounded ${details.method === 'GET' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
                    {details.method}
                  </span>
                  <span className="font-mono text-xs text-[#D97706] font-bold">{path}</span>
                </div>
                <p className="text-xs text-[#57534E] mt-2 line-clamp-2 leading-relaxed">
                  {details.desc}
                </p>
              </button>
            );
          })}

          <div className="bg-[#FDFBF7] border border-[#E6E2D3] rounded-xl p-4 text-xs text-[#57534E] mt-4 space-y-2">
            <span className="font-bold text-[#D97706] font-serif">Integration Quick Tips:</span>
            <p>Ensure payload includes <code className="text-[#D97706] font-mono">"Content-Type: application/json"</code>.</p>
            <p>Sanskrit word breaks are computed recursively per line to preserve classical rhythms.</p>
          </div>
        </div>

        {/* Right Tab Content Column */}
        <div className="md:col-span-8 bg-white p-5 rounded-2xl border border-[#E6E2D3] flex flex-col min-h-[460px] shadow-sm">
          {activeTab === 'docs' ? (
            <div className="flex-1 flex flex-col">
              {/* Language Picker in Header */}
              <div className="flex justify-between items-center bg-[#F9F7F2] px-4 py-2 rounded-lg border border-[#E6E2D3] mb-4">
                <div className="flex gap-2 items-center text-xs text-[#57534E]">
                  <Terminal className="w-3.5 h-3.5 text-[#78716C]" />
                  <span className="font-semibold">Interactive Code Blocks</span>
                </div>
                <div className="flex gap-1.5">
                  {(['curl', 'js', 'python'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`px-2.5 py-1 text-[10px] font-mono rounded transition-colors cursor-pointer ${selectedLang === lang ? 'bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20 font-bold' : 'text-[#78716C] hover:text-[#D97706]'}`}
                    >
                      {lang === 'curl' ? 'cURL' : lang === 'js' ? 'Fetch API' : 'Python'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Snippet display */}
              <div className="relative flex-1 bg-[#FDFBF7] rounded-xl border border-[#E6E2D3] p-4 font-mono text-xs overflow-x-auto text-[#1C1917] leading-relaxed min-h-[280px]">
                <button
                  onClick={() => copyToClipboard(getCodeSnippet(selectedLang, selectedEndpoint, reqBody), 'snippet')}
                  className="absolute top-3 right-3 p-1.5 bg-white hover:bg-[#F9F7F2] border border-[#E6E2D3] text-[#78716C] hover:text-[#D97706] rounded transition-all cursor-pointer shadow-sm"
                  title="Copy Code Snippet"
                >
                  {copiedSection === 'snippet' ? <Check className="w-3.5 h-3.5 text-green-600 font-bold" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <div className="whitespace-pre pr-8">
                  {getCodeSnippet(selectedLang, selectedEndpoint, reqBody)}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
                {/* JSON Input Sandbox */}
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#78716C] font-bold">
                      {selectedEndpoint === '/api/scriptures' ? 'Request Parameters' : 'Request Body (JSON)'}
                    </label>
                    {selectedEndpoint !== '/api/scriptures' && (
                      <button
                        onClick={() => setReqBody(defaultBodies[selectedEndpoint])}
                        className="text-[10px] text-[#D97706] hover:text-[#B45309] transition-colors font-bold cursor-pointer"
                      >
                        Reset Payload
                      </button>
                    )}
                  </div>
                  {selectedEndpoint === '/api/scriptures' ? (
                    <div className="flex-1 w-full bg-[#F5F5F4]/60 border border-[#E6E2D3] rounded-xl p-4 font-mono text-xs text-[#78716C] flex items-center justify-center text-center min-h-[220px]">
                      GET request. No request body or extra payload parameters are required for retrieving the list of scriptures.
                    </div>
                  ) : (
                    <textarea
                      value={reqBody}
                      onChange={(e) => setReqBody(e.target.value)}
                      className="flex-1 w-full bg-[#FDFBF7] border border-[#E6E2D3] rounded-xl p-3 font-mono text-[11px] text-[#1C1917] focus:outline-none focus:border-[#D97706] resize-none min-h-[220px]"
                    />
                  )}
                  <button
                    onClick={handleTestApi}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-[#2D241E] text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 text-xs shadow-sm cursor-pointer uppercase tracking-wider"
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-white" />
                    )}
                    <span>{isLoading ? 'Executing Request...' : 'Trigger API Request'}</span>
                  </button>
                </div>

                {/* Response Code Block */}
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center h-5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#78716C] font-bold">API RESPONSE</span>
                    {apiResponse && (
                      <button
                        onClick={() => copyToClipboard(apiResponse, 'response')}
                        className="flex items-center gap-1 text-[10px] text-[#D97706] hover:text-[#B45309] font-bold cursor-pointer"
                      >
                        {copiedSection === 'response' ? <Check className="w-3 text-green-600 font-bold" /> : <Copy className="w-3" />}
                        <span>Copy Output</span>
                      </button>
                    )}
                  </div>

                  <div className="flex-1 bg-[#FDFBF7] border border-[#E6E2D3] rounded-xl p-3 font-mono text-[11px] text-[#1C1917] overflow-y-auto max-h-[300px] lg:max-h-none min-h-[260px] relative">
                    {isLoading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex flex-col gap-2 items-center justify-center text-xs text-[#D97706] font-bold">
                        <span className="w-6 h-6 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin" />
                        <span>Fetching scriptural parameters...</span>
                      </div>
                    )}
                    {apiError ? (
                      <div className="text-red-800 bg-red-50 p-3 rounded-lg border border-red-200 whitespace-pre-wrap leading-relaxed font-semibold">
                        ⚠️ Error: {apiError}
                      </div>
                    ) : apiResponse ? (
                      <pre className="whitespace-pre-wrap">{apiResponse}</pre>
                    ) : (
                      <div className="h-full flex items-center justify-center text-[#78716C] text-[11px] text-center px-4 leading-relaxed">
                        Customize the JSON body on the left and click "Trigger API Request" to parse translation and metadata in real-time.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

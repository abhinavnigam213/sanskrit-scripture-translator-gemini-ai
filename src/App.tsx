import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Copy, 
  Check, 
  Book, 
  Trash2, 
  Terminal, 
  Globe, 
  HelpCircle,
  Activity,
  AlertCircle,
  FileCode,
  Compass
} from 'lucide-react';
import { POPULAR_SCRIPTURES } from './data/scriptures.ts';
import { Scripture, TranslationResponse, ScriptureAnalyzeResponse, TransliterateResponse } from './types.ts';
import ApiPlayground from './components/ApiPlayground.tsx';

function webDevanagariToSlp1(text: string): string {
  const vowels: { [key: string]: string } = {
    'अ': 'a', 'आ': 'A', 'इ': 'i', 'ई': 'I', 'उ': 'u', 'ऊ': 'U', 'ऋ': 'f', 'ॠ': 'F', 'ऌ': 'x', 'ॡ': 'X',
    'ए': 'e', 'ऐ': 'E', 'ओ': 'o', 'औ': 'O'
  };

  const matras: { [key: string]: string } = {
    'ा': 'A', 'ि': 'i', 'ी': 'I', 'ु': 'u', 'ू': 'U', 'ृ': 'f', 'ॄ': 'F', 'ॢ': 'x', 'ॣ': 'X',
    'े': 'e', 'ै': 'E', 'ो': 'o', 'ौ': 'O'
  };

  const consonants: { [key: string]: string } = {
    'क': 'k', 'ख': 'K', 'ग': 'g', 'घ': 'G', 'ङ': 'N',
    'च': 'c', 'छ': 'C', 'ज': 'j', 'झ': 'J', 'ञ': 'Y',
    'ट': 'w', 'ठ': 'W', 'ड': 'q', 'ढ': 'Q', 'ण': 'R',
    'त': 't', 'थ': 'T', 'द': 'd', 'ध': 'D', 'न': 'n',
    'प': 'p', 'फ': 'P', 'ब': 'b', 'भ': 'B', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
    'श': 'S', 'ष': 'z', 'स': 's', 'ह': 'h',
    'ळ': 'L', 'क्ष': 'kz', 'त्र': 'tr', 'ज्ञ': 'jY'
  };

  const shunya: { [key: string]: string } = {
    'ं': 'M',
    'ः': 'H',
    'ँ': '~'
  };

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === 'ॐ') {
      result += 'oM';
      continue;
    }

    if (consonants[char] !== undefined) {
      let base = consonants[char];
      if (nextChar === '्') {
        result += base;
        i++; // skip halant
      } else if (matras[nextChar] !== undefined) {
        result += base + matras[nextChar];
        i++; // skip matra
      } else {
        result += base + 'a';
      }
    } else if (vowels[char] !== undefined) {
      result += vowels[char];
    } else if (shunya[char] !== undefined) {
      result += shunya[char];
    } else {
      result += char === '।' ? '|' : char === '॥' ? '||' : char === 'ऽ' ? "'" : char;
    }
  }
  return result;
}

export default function App() {
  const [text, setText] = useState<string>(POPULAR_SCRIPTURES[0].verse);
  const [sourceLang, setSourceLang] = useState<'sanskrit' | 'hindi' | 'english' | 'auto'>('sanskrit');
  const [targetLang, setTargetLang] = useState<'sanskrit' | 'hindi' | 'english'>('english');
  const [scriptureContext, setScriptureContext] = useState<string>(POPULAR_SCRIPTURES[0].source);
  
  // Tabs for the result workspace
  const [activeTab, setActiveTab] = useState<'translation' | 'grammar' | 'transliteration' | 'api'>('translation');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Loading and Error state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Hydrated full analysis/translation state (Preload Bhagavad Gita 2.47 for direct immediate beautiful display)
  const [analysisResult, setAnalysisResult] = useState<ScriptureAnalyzeResponse | null>({
    verse: POPULAR_SCRIPTURES[0].verse,
    identifiedSource: POPULAR_SCRIPTURES[0].source,
    transliterationIAST: POPULAR_SCRIPTURES[0].transliterationDefault,
    transliterationPhonetic: "karma-ny-eva-dhi-ka-ras te ma pha-le-shu ka-da-cha-na | ma karma-pha-la-he-tur bhu-rma te san-go 'stv a-kar-ma-ni ||",
    translationEnglish: POPULAR_SCRIPTURES[0].translationDefaultEnglish,
    translationHindi: POPULAR_SCRIPTURES[0].translationDefaultHindi,
    poeticMeter: "Anustubh (8 syllables per quarter)",
    spiritualSignificance: "This is one of the most celebrated verses of the Bhagavad Gita expressing Lord Krishna's core teaching on Karma Yoga (the path of selfless work). It teaches four main tenets: (1) Do your duty without hesitation, (2) Detach yourself from the fruits/results of the activity, (3) Do not assume your ego is the primary creator of outputs, and (4) Avoid falling into nihilistic lethargy or choosing non-action. True action exists as worship itself.",
    wordBreakdown: [
      { word: "कर्मणि", grammar: "Locative Singular (in Karma/duty)", meaningHindi: "कर्म में", meaningEnglish: "in action / in duty" },
      { word: "एव", grammar: "Indeclinable (Only/Indeed)", meaningHindi: "ही", meaningEnglish: "only / indeed" },
      { word: "अधिकारः", grammar: "Nominative Singular (Right/Authority)", meaningHindi: "अधिकार", meaningEnglish: "right / authority" },
      { word: "ते", grammar: "Genitive Singular (Thy/Your)", meaningHindi: "तुम्हारा", meaningEnglish: "your" },
      { word: "मा", grammar: "Negative particle (Let not/Never)", meaningHindi: "मत", meaningEnglish: "let not" },
      { word: "फलेषु", grammar: "Locative Plural (in results/fruits)", meaningHindi: "फलों में", meaningEnglish: "in the fruits / results" },
      { word: "कदाचन", grammar: "Adverb particle (at any time/ever)", meaningHindi: "कभी भी", meaningEnglish: "at any time / ever" },
      { word: "मा", grammar: "Negative particle", meaningHindi: "मत", meaningEnglish: "not" },
      { word: "कर्मफलहेतुः", grammar: "Compounded Nominative (source of results)", meaningHindi: "कर्मफल का कारण", meaningEnglish: "cause of action fruits" },
      { word: "भूः", grammar: "Aorist Imperative (be)", meaningHindi: "बनो / बनिए", meaningEnglish: "become / be" },
      { word: "ते", grammar: "Genitive Singular (your)", meaningHindi: "तुम्हारी", meaningEnglish: "your" },
      { word: "सङ्गः", grammar: "Nominative Singular (attachment)", meaningHindi: "आसक्ति", meaningEnglish: "attachment" },
      { word: "अस्तु", grammar: "Imperative Singular (let there be)", meaningHindi: "होवे", meaningEnglish: "let there be" },
      { word: "अकर्मणि", grammar: "Locative Singular (in non-action)", meaningHindi: "अकर्म में", meaningEnglish: "in non-action" }
    ]
  });

  // Transliteration matrix state
  const [transliterations, setTransliterations] = useState<{
    devanagari: string;
    iast: string;
    itrans: string;
    phonetic: string;
    slp1: string;
  }>({
    devanagari: POPULAR_SCRIPTURES[0].verse,
    iast: POPULAR_SCRIPTURES[0].transliterationDefault,
    itrans: "karmanyevaadhikaaraste maa phaleshu kadaachana | maa karmaphalaheturbhuurmaa te sango'stvakarmani ||",
    phonetic: "karma-ny-eva-dhi-ka-ras te ma pha-le-shu ka-da-cha-na | ma karma-pha-la-he-tur bhu-rma te san-go 'stv a-kar-ma-ni ||",
    slp1: "karmaRyevADikAraste mA Palezu kadAcana |\nmA karmapalaheturbhUrmA te saNgo'stvakarmaRi ||"
  });

  // Select a preset scripture
  const selectScripture = (sc: Scripture) => {
    setText(sc.verse);
    setScriptureContext(sc.source);
    
    // Quick hydrate UI state with default values instantly, then trigger deep analyze
    setTransliterations({
      devanagari: sc.verse,
      iast: sc.transliterationDefault,
      itrans: "Loading scriptural variations...",
      phonetic: "Loading chant phonetics...",
      slp1: webDevanagariToSlp1(sc.verse)
    });

    setAnalysisResult({
      verse: sc.verse,
      identifiedSource: sc.source,
      transliterationIAST: sc.transliterationDefault,
      transliterationPhonetic: "Generating chant instructions...",
      translationEnglish: sc.translationDefaultEnglish,
      translationHindi: sc.translationDefaultHindi,
      spiritualSignificance: "Triggering Gemini AI to build deep structural, poetic, and spiritual translation panels...",
      wordBreakdown: []
    });

    // Auto trigger translation/analysis
    triggerAnalysis(sc.verse, sc.source);
  };

  // Trigger Sanskrit deep analysis API
  const triggerAnalysis = async (inputText: string, ctx?: string) => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, sourceContext: ctx || scriptureContext })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze scripture");
      }

      setAnalysisResult(data);

      // Trigger standard transliterations in parallel or fetch from model results
      setTransliterations({
        devanagari: data.verse,
        iast: data.transliterationIAST,
        itrans: inputText.length < 50 ? `${inputText} (translating...)` : "Generating scriptural representation...",
        phonetic: data.transliterationPhonetic,
        slp1: webDevanagariToSlp1(data.verse || inputText)
      });

      // Also trigger a pure transliteration run for ITRANS specifically
      const translitRes = await fetch('/api/transliterate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: data.verse || inputText,
          sourceScript: 'devanagari',
          targetScript: 'itrans'
        })
      });
      if (translitRes.ok) {
        const transData: TransliterateResponse = await translitRes.json();
        setTransliterations(prev => ({
          ...prev,
          itrans: transData.transliteratedText
        }));
      }

    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "An unexpected network error occurred while communicating with the server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick translation (Sanskrit, Hindi, English direct mapping)
  const triggerSimpleTranslation = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          sourceLang: sourceLang,
          targetLang: targetLang,
          scriptureContext: scriptureContext
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete translation");
      }

      // Convert standard TranslationResponse into ScriptureAnalyzeResponse structure, appending explanations
      setAnalysisResult({
        verse: text,
        identifiedSource: scriptureContext || "User Input Text",
        transliterationIAST: transliterations.iast || "Click 'Transliterate' tab to build phonetic representations",
        transliterationPhonetic: "Generated translation details below.",
        translationEnglish: targetLang === 'english' ? data.translatedText : (sourceLang === 'english' ? text : "Use English target selector"),
        translationHindi: targetLang === 'hindi' ? data.translatedText : (sourceLang === 'hindi' ? text : "Use Hindi target selector"),
        translationSanskrit: targetLang === 'sanskrit' ? data.translatedText : undefined,
        spiritualSignificance: data.explanation || "No additional theological significance supplied.",
        wordBreakdown: data.wordBreakdown || []
      });

    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "An unexpected error occurred during direct translation.");
    } finally {
      setIsLoading(false);
    }
  };

  // Pure transliteration run
  const triggerPureTransliteration = async (target: 'iast' | 'itrans' | 'english_phonetic' | 'devanagari' | 'slp1') => {
    if (!text.trim()) return;
    setIsLoading(true);
    setApiError(null);
    try {
      if (target === 'slp1') {
        const localSlp = webDevanagariToSlp1(text);
        setTransliterations(prev => ({
          ...prev,
          slp1: localSlp
        }));
        setActiveTab('transliteration');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/transliterate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          sourceScript: sourceLang === 'sanskrit' ? 'devanagari' : 'devanagari',
          targetScript: target
        })
      });
      const data: TransliterateResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.transliteratedText || "Failed to perform transliteration");
      }

      setTransliterations(prev => ({
        ...prev,
        [target === 'english_phonetic' ? 'phonetic' : target]: data.transliteratedText
      }));

      // Switch to transliteration view tab
      setActiveTab('transliteration');

    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "An error occurred during transliteration mapping.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (content: string, key: string) => {
    navigator.clipboard.writeText(content);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Dynamically compute translation card content to prevent "Use Hindi target selector" or empty scenarios and cleanly handle Sanskrit translations
  const isSanskritTarget = targetLang === 'sanskrit' || !!analysisResult?.translationSanskrit;

  let leftCardTitle = "English Prose Translation";
  let leftCardContent = analysisResult?.translationEnglish || "";
  let leftCardCopyKey = "eng";

  let rightCardTitle = "हिन्दी गद्यानुवाद (Hindi Translation)";
  let rightCardContent = analysisResult?.translationHindi || "";
  let rightCardCopyKey = "hin";

  if (isSanskritTarget) {
    if (sourceLang === 'english') {
      leftCardTitle = "English Source Input";
    } else if (sourceLang === 'hindi') {
      leftCardTitle = "Hindi Source Input";
    } else {
      leftCardTitle = "Original Scripture Source";
    }
    leftCardContent = text || analysisResult?.verse || "";
    leftCardCopyKey = "src";

    rightCardTitle = "Sanskrit Translation (संस्कृतम्)";
    rightCardContent = analysisResult?.translationSanskrit || "";
    rightCardCopyKey = "san";
  } else {
    // If either has a "Use target selector" instruction, dynamically replace with the original source/user text
    if (leftCardContent === "Use English target selector") {
      if (sourceLang === 'hindi') {
        leftCardTitle = "Hindi Source Input";
      } else if (sourceLang === 'sanskrit') {
        leftCardTitle = "Sanskrit Source Input";
      } else {
        leftCardTitle = "Original Verse Input";
      }
      leftCardContent = text || analysisResult?.verse || "";
      leftCardCopyKey = "src";
    }
    if (rightCardContent === "Use Hindi target selector") {
      if (sourceLang === 'english') {
        rightCardTitle = "English Source Input";
      } else if (sourceLang === 'sanskrit') {
        rightCardTitle = "Sanskrit Source Input";
      } else {
        rightCardTitle = "Original Verse Input";
      }
      rightCardContent = text || analysisResult?.verse || "";
      rightCardCopyKey = "src";
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D241E] flex flex-col antialiased selection:bg-[#D97706] selection:text-white">
      
      {/* Decorative Golden Top bar */}
      <div className="h-1 w-full bg-[#D97706] shadow-sm" />

      {/* Main Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col space-y-6">

        {/* Unified Application Header banner */}
        <header id="app-header-section" className="relative p-6 rounded-2xl bg-[#F9F7F2] border border-[#E6E2D3] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 overflow-hidden shadow-sm">
          
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#D97706] shadow-sm flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[#D97706] tracking-widest text-[10px] font-bold uppercase bg-[#D97706]/10 px-2 py-0.5 rounded border border-[#D97706]/20 shadow-sm">
                  Veda-Vāṇī
                </span>
                <span className="text-[10px] bg-[#E6E2D3] text-[#57534E] font-mono px-1.5 py-0.5 rounded border border-[#E6E2D3]">
                  v1.2 Full-Stack
                </span>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#1C1917] mt-1">
                Scripture <span className="font-sans font-normal text-[#D97706]">Translator</span> & Transliteration
              </h1>
              <p className="font-serif text-xs text-[#78716C] mt-1 italic tracking-normal">
                "ॐ असतो मा सद्गमय। तमसो मा ज्योतिर्गमय।" — Lead us from darkness to light.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 text-right self-stretch md:self-auto bg-[#F9F7F2] p-3 rounded-xl border border-[#E6E2D3]">
            <div className="flex items-center gap-1 text-[#57534E] text-xs">
              <Compass className="w-4 h-4 text-[#D97706] animate-pulse" />
              <span className="font-semibold text-[#1C1917]">Sanskrit • Hindi • English</span>
            </div>
            <p className="text-[10px] text-[#78716C] mt-1 leading-relaxed">
              Vedic parsing engine powered by Gemini AI model with word-by-word sandhi logic.
            </p>
          </div>
        </header>

        {/* Global Warning Banner for missing API credentials */}
        {apiError && apiError.includes("GEMINI_API_KEY") && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-start gap-3 text-xs leading-relaxed">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-red-800 mb-1">Secrets Configuration Required</span>
              Your Sanskrit translation services are currently running in secure api mode. To perform live translations via Gemini, go to **Settings &gt; Secrets** panel in the AI Studio UI and enter your <code className="bg-[#E6E2D3] px-1 py-0.5 rounded text-red-900 font-mono border border-red-200">GEMINI_API_KEY</code>.
            </div>
          </div>
        )}

        {/* SCRIPTURE DOCK: pre-loaded examples click picker */}
        <section id="popular-scriptures-bar" className="space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <Compass className="w-3.5 h-3.5 text-[#D97706]" />
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#78716C] font-semibold">
              Browse Sanctified Verses / Popular Presets
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {POPULAR_SCRIPTURES.map((sc) => {
              const works = scriptureContext === sc.source;
              return (
                <button
                  key={sc.id}
                  onClick={() => selectScripture(sc)}
                  className={`flex-shrink-0 text-left p-3.5 w-64 md:w-72 rounded-xl border transition-all duration-300 cursor-pointer ${works ? 'bg-white border-[#D97706] shadow-sm text-[#1C1917]' : 'bg-[#F9F7F2] border-[#E6E2D3] hover:bg-[#E6E2D3]/20 hover:border-[#D97706]/40 text-[#44403C]'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D97706]/10 border border-[#D97706]/20 text-[#D97706] font-semibold">
                      {sc.category}
                    </span>
                    <span className="text-[10px] text-[#78716C] font-mono">{sc.source}</span>
                  </div>
                  <h4 className="font-serif text-sm font-semibold text-[#1C1917] mt-2 line-clamp-1">{sc.title}</h4>
                  <p className="text-xs text-[#57534E] mt-1 font-serif line-clamp-2 italic leading-relaxed">
                    {sc.verse}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* MAIN ROW: Twin splits (Input Workspace Left, Results Console Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Input Control Center (col-span 5) */}
          <div id="input-control-panel" className="lg:col-span-5 space-y-4">
            
            <div className="bg-[#F9F7F2] p-5 rounded-2xl border border-[#E6E2D3] flex flex-col space-y-4">
              
              <div className="flex justify-between items-center border-b border-[#E6E2D3] pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#D97706]" />
                  <h3 className="font-serif font-bold text-[#1C1917]">Translation Workbench</h3>
                </div>
                <span className="text-[11px] font-mono text-[#57534E] bg-white px-2 py-1 rounded border border-[#E6E2D3]">
                  {text.trim().length} characters
                </span>
              </div>

              {/* Language Routing parameters */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* Source Select */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider font-semibold">Source Language</label>
                  <select
                    value={sourceLang}
                    onChange={(e: any) => setSourceLang(e.target.value)}
                    className="bg-white border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs font-medium text-[#2D241E] focus:outline-none focus:border-[#D97706] shadow-sm"
                  >
                    <option value="sanskrit">Sanskrit (संस्कृतम्)</option>
                    <option value="hindi">Hindi (हिन्दी)</option>
                    <option value="english">English (Anglais)</option>
                    <option value="auto">Auto-Detect Script</option>
                  </select>
                </div>

                {/* Target Select */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider font-semibold">Target Language</label>
                  <select
                    value={targetLang}
                    onChange={(e: any) => setTargetLang(e.target.value)}
                    className="bg-white border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs font-medium text-[#2D241E] focus:outline-none focus:border-[#D97706] shadow-sm"
                  >
                    <option value="english">English (Prose & Verse)</option>
                    <option value="hindi">Hindi (गद्य अनुवाद)</option>
                    <option value="sanskrit">Sanskrit (Devanagari mapping)</option>
                  </select>
                </div>

              </div>

              {/* Context prompt */}
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between">
                  <label className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider font-semibold">Scriptural Context (Optional)</label>
                  <span className="text-[9px] font-mono text-[#78716C]">Improves commentary match</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Bhagavad Gita, Yajurveda, Upanishads"
                  value={scriptureContext}
                  onChange={(e) => setScriptureContext(e.target.value)}
                  className="bg-white border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#D97706] font-serif placeholder:font-sans placeholder:text-[#A8A29E] shadow-sm"
                />
              </div>

              {/* Large text workspace */}
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <label className="font-mono text-[#78716C] uppercase tracking-wider font-semibold">Verse Input (Devanagari or English Text)</label>
                  <button 
                    onClick={() => { setText(''); setScriptureContext(''); }}
                    className="flex items-center gap-1 text-[10px] text-red-650 hover:text-red-750 transition-colors cursor-pointer font-semibold"
                    title="Clear content"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
                
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste Sanskrit verse, Sloka, Mantra or commentary here (e.g. ॐ भूर् भुवः स्वः...)"
                  className="w-full h-48 bg-white border border-[#E6E2D3] rounded-xl p-4 text-[#1C1917] font-serif placeholder:font-sans placeholder:text-[#A8A29E] leading-relaxed text-sm md:text-base focus:outline-none focus:border-[#D97706] resize-none shadow-sm"
                />
              </div>

              {/* API and Processing triggers */}
              <div className="flex flex-col gap-2 pt-2">
                
                {/* Advanced Indology Analysis Button */}
                <button
                  type="button"
                  onClick={() => triggerAnalysis(text)}
                  disabled={isLoading || !text.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-[#2D241E] text-white font-bold tracking-wider uppercase py-3 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 cursor-pointer text-xs"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white fill-current" />
                  )}
                  <span>Translate & Analyze Verse</span>
                </button>

                {/* Direct Simple Translation / Transliteration alternate options */}
                <div className="grid grid-cols-2 gap-2">
                  
                  <button
                    onClick={triggerSimpleTranslation}
                    disabled={isLoading || !text.trim()}
                    className="py-2.5 px-3 bg-white border border-[#E6E2D3] text-[#57534E] hover:text-[#D97706] hover:bg-[#F9F7F2] rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Direct Translation</span>
                  </button>

                  <button
                    onClick={() => triggerPureTransliteration('iast')}
                    disabled={isLoading || !text.trim()}
                    className="py-2.5 px-3 bg-white border border-[#E6E2D3] text-[#57534E] hover:text-[#D97706] hover:bg-[#F9F7F2] rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Build diacritics (IAST)</span>
                  </button>

                </div>

              </div>

            </div>

            {/* Quick helper about Sanskrit / Transliteration formats */}
            <div className="p-4 bg-[#FDFBF7] border border-[#E6E2D3] rounded-xl flex items-start gap-3">
              <HelpCircle className="w-4 h-4 text-[#78716C] shrink-0 mt-0.5" />
              <div className="text-xs text-[#57534E] space-y-1">
                <span className="font-bold text-[#D97706] font-serif text-[11px] block">Understanding Transliteration:</span>
                <p><strong>Devanagari</strong> is the traditional divine script of India.</p>
                <p><strong>IAST</strong> is the international scientific standard utilizing diacritic markers (like ī, ṣ, ṁ) for perfect pronouncing metrics.</p>
                <p><strong>ITRANS</strong> is standard English-keyboard layout translation representing phonetic tones in simple characters.</p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Golden Detailed Results Center (col-span 7) */}
          <div id="results-panel" className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* Header Tabs */}
            <div className="flex bg-[#F5F5F4] border border-[#E6E2D3] p-1 rounded-xl w-full select-none">
              
              <button
                onClick={() => setActiveTab('translation')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'translation' ? 'bg-white shadow-sm rounded-lg text-[#1C1917] font-bold border border-[#E6E2D3]' : 'text-[#57534E] hover:text-[#D97706]'}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Translation & Commentary</span>
              </button>

              <button
                onClick={() => setActiveTab('grammar')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'grammar' ? 'bg-white shadow-sm rounded-lg text-[#1C1917] font-bold border border-[#E6E2D3]' : 'text-[#57534E] hover:text-[#D97706]'}`}
              >
                <Book className="w-3.5 h-3.5" />
                <span>Padapatha Grammar</span>
              </button>

              <button
                onClick={() => setActiveTab('transliteration')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'transliteration' ? 'bg-white shadow-sm rounded-lg text-[#1C1917] font-bold border border-[#E6E2D3]' : 'text-[#57534E] hover:text-[#D97706]'}`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Transliteration Matrix</span>
              </button>

              <button
                onClick={() => setActiveTab('api')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'api' ? 'bg-white shadow-sm rounded-lg text-[#1C1917] font-bold border border-[#E6E2D3]' : 'text-[#57534E] hover:text-[#D97706]'}`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Developer APIs</span>
              </button>

            </div>

            {/* Inner Dashboard results container */}
            <div className="bg-white border border-[#E6E2D3] rounded-2xl p-6 min-h-[460px] flex flex-col relative overflow-hidden shadow-sm">
              <AnimatePresence mode="wait">
                
                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center space-y-3">
                    <span className="w-10 h-10 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-serif text-[#D97706] font-bold">Deconstructing Sandhis & Metaphorical Meanings...</p>
                    <p className="text-[10px] font-mono text-[#78716C] tracking-wider">Invoking Gemini endpoint</p>
                  </div>
                )}

                {/* TAB 1: Detailed Commentary and prose values */}
                {activeTab === 'translation' && (
                  <motion.div
                    key="tab-translation"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5 flex-1 flex flex-col"
                  >
                    
                    {/* Verse Identification header */}
                    <div className="flex justify-between items-center bg-[#F9F7F2] p-4 rounded-xl border border-[#E6E2D3]">
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-[#D97706] font-bold animate-pulse">Identified Liturgy Resource</span>
                        <h4 className="font-serif text-base font-bold text-[#1C1917] mt-1">{analysisResult?.identifiedSource || "Custom Sanskrit Input"}</h4>
                      </div>
                      {analysisResult?.poeticMeter && (
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-[#78716C] font-bold block">Chhandas (Poetic Meter)</span>
                          <span className="font-serif text-sm text-[#2D241E] mt-1 font-medium italic block">{analysisResult?.poeticMeter}</span>
                        </div>
                      )}
                    </div>

                     {/* Translations stack */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Left Dynamic Translation/Source Card */}
                      <div className="p-6 bg-[#F9F7F2] border border-[#E6E2D3] rounded-xl flex flex-col relative">
                        <div className="flex justify-between items-center text-[10px] text-[#78716C] font-mono tracking-wider mb-2 uppercase border-b border-[#E6E2D3] pb-1.5 font-bold">
                          <span>{leftCardTitle}</span>
                          <button 
                            onClick={() => handleCopyText(leftCardContent, leftCardCopyKey)}
                            className="text-[#D97706] hover:text-[#B45309] cursor-pointer"
                          >
                            {copiedText === leftCardCopyKey ? <Check className="w-3 h-3 text-green-600 font-bold" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <p className="text-sm text-[#1C1917] font-serif leading-relaxed italic mt-2">
                          "{leftCardContent || "Translation not started. Run 'Translate' module to generate values."}"
                        </p>
                      </div>

                      {/* Right Dynamic Translation Card */}
                      <div className="p-6 bg-[#F9F7F2] border border-[#E6E2D3] rounded-xl flex flex-col relative font-serif">
                        <div className="flex justify-between items-center text-[10px] text-[#78716C] font-mono tracking-wider mb-2 uppercase border-b border-[#E6E2D3] pb-1.5 font-bold">
                          <span>{rightCardTitle}</span>
                          <button 
                            onClick={() => handleCopyText(rightCardContent, rightCardCopyKey)}
                            className="text-[#D97706] hover:text-[#B45309] cursor-pointer"
                          >
                            {copiedText === rightCardCopyKey ? <Check className="w-3 h-3 text-green-600 font-bold" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <p className="text-sm text-[#1C1917] leading-relaxed italic mt-2">
                          "{rightCardContent || "Translation not started. Run 'Translate' module to generate values."}"
                        </p>
                      </div>

                    </div>

                    {/* Deep theological explanation */}
                    <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-[#E6E2D3] space-y-4 shadow-none">
                      <div className="flex items-center gap-1.5 text-[#D97706]">
                        <Sparkles className="w-4 h-4 fill-[#D97706]" />
                        <h4 className="font-serif text-sm font-bold tracking-wider uppercase">Spiritual Significance & Scholarly Commentary</h4>
                      </div>
                      <div className="font-sans text-xs text-[#44403C] leading-relaxed space-y-2">
                        {analysisResult?.spiritualSignificance ? (
                           analysisResult.spiritualSignificance.split('\n').map((para, i) => (
                             <p key={i}>{para}</p>
                           ))
                        ) : (
                          <p className="text-[#78716C] font-serif">Deep commentarial insights will appear here once translated via backend services.</p>
                        )}
                      </div>
                    </div>

                  </motion.div>
                )}

                {/* TAB 2: Padapatha Grammar elements */}
                {activeTab === 'grammar' && (
                  <motion.div
                    key="tab-grammar"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 flex-1 flex flex-col"
                  >
                    <div className="bg-[#F9F7F2] p-4 rounded-xl border border-[#E6E2D3]">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#78716C] font-bold">Deconstructive Study</span>
                      <h4 className="font-serif text-base font-bold text-[#1C1917]">Padapatha (Sadhana Word Breaks)</h4>
                      <p className="text-xs text-[#57534E] mt-1 text-justify leading-relaxed">
                        Sanskrit compounds multiple words together through complex phonetic shift rules called <strong>Sandhi</strong>. The grid below splits the compounds and details grammatical cases.
                      </p>
                    </div>

                    <div className="border border-[#E6E2D3] rounded-xl overflow-hidden overflow-x-auto flex-1 bg-white">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#F9F7F2] border-b border-[#E6E2D3] font-mono text-[#44403C] text-[10px] font-bold">
                            <th className="p-3">Sanskrit Word / Root</th>
                            <th className="p-3">Grammar & Case Conjugation</th>
                            <th className="p-3">English Meanings</th>
                            <th className="p-3">हिन्दी अनुवाद (Hindi)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E6E2D3] font-sans">
                          {analysisResult?.wordBreakdown && analysisResult.wordBreakdown.length > 0 ? (
                            analysisResult.wordBreakdown.map((row, i) => (
                              <tr key={i} className="hover:bg-[#FDFBF7] transition-colors">
                                <td className="p-3 font-serif font-bold text-[#D97706]">{row.word}</td>
                                <td className="p-3 font-mono text-[#57534E] text-[11px]">{row.grammar || 'Noun / indeclinable'}</td>
                                <td className="p-3 text-[#2D241E]">{row.meaningEnglish}</td>
                                <td className="p-3 text-[#44403C] font-serif">{row.meaningHindi}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="p-12 text-center text-[#78716C] font-serif">
                                Word-by-word grammatical splits are available when translating. Press "Translate & Analyze" to generate database metrics.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* TAB 3: Transliteration Matrix */}
                {activeTab === 'transliteration' && (
                  <motion.div
                    key="tab-transliteration"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 flex-1 flex flex-col"
                  >
                    <div className="bg-[#F9F7F2] p-4 rounded-xl border border-[#E6E2D3]">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-wider text-[#78716C] font-bold">Script Converter Matrix</span>
                          <h4 className="font-serif text-base font-bold text-[#1C1917]">Orthographic Character Conversions</h4>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              triggerPureTransliteration('english_phonetic');
                              triggerPureTransliteration('slp1');
                            }}
                            className="bg-white border border-[#E6E2D3] hover:text-[#D97706] px-3 py-1.5 text-[10px] font-mono rounded-lg transition-colors cursor-pointer"
                          >
                            Regenerate Matrix
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-[#57534E] mt-1 lg:max-w-2xl text-justify leading-relaxed">
                        Indic transliteration maps original characters verbatim into other script standards so researchers can pronounce mantras perfectly without reading Devanagari.
                      </p>
                    </div>

                    {/* Standardized Conversions Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                      
                      {/* DEVANAGARI CARD */}
                      <div className="bg-[#F9F7F2] border border-[#E6E2D3] rounded-xl p-4 flex flex-col">
                        <div className="flex justify-between items-center text-[10px] text-[#D97706] font-mono tracking-wider uppercase border-b border-[#E6E2D3] pb-1.5 mb-2 font-bold">
                          <span>Devanagari (Traditional Sanskrit)</span>
                          <button 
                            onClick={() => handleCopyText(transliterations.devanagari, 'dev')}
                            className="text-[#D97706] hover:text-[#B45309] cursor-pointer"
                          >
                            {copiedText === 'dev' ? <Check className="w-3 h-3 text-green-600 font-bold" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <p className="flex-1 text-[#1C1917] font-serif whitespace-pre-wrap text-sm leading-relaxed antialiased">
                          {transliterations.devanagari}
                        </p>
                      </div>

                      {/* IAST CARD */}
                      <div className="bg-[#F9F7F2] border border-[#E6E2D3] rounded-xl p-4 flex flex-col">
                        <div className="flex justify-between items-center text-[10px] text-[#1C1917] font-mono tracking-wider uppercase border-b border-[#E6E2D3] pb-1.5 mb-2 font-bold">
                          <span>IAST (Academic Diacritics)</span>
                          <button 
                            onClick={() => handleCopyText(transliterations.iast, 'ias')}
                            className="text-[#D97706] hover:text-[#B45309] cursor-pointer"
                          >
                            {copiedText === 'ias' ? <Check className="w-3 h-3 text-green-600 font-bold" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <p className="flex-1 text-[#2D241E] font-serif whitespace-pre-wrap text-sm leading-relaxed italic tracking-wider">
                          {transliterations.iast}
                        </p>
                      </div>

                      {/* ITRANS CARD */}
                      <div className="bg-[#F9F7F2] border border-[#E6E2D3] rounded-xl p-4 flex flex-col">
                        <div className="flex justify-between items-center text-[10px] text-[#44403C] font-mono tracking-wider uppercase border-b border-[#E6E2D3] pb-1.5 mb-2 font-bold">
                          <span>ITRANS (Keyboard ASCII Syntax)</span>
                          <button 
                            onClick={() => handleCopyText(transliterations.itrans, 'itr')}
                            className="text-[#D97706] hover:text-[#B45309] cursor-pointer"
                          >
                            {copiedText === 'itr' ? <Check className="w-3 h-3 text-green-600 font-bold" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <p className="flex-1 text-[#57534E] font-mono whitespace-pre-wrap text-xs leading-relaxed">
                          {transliterations.itrans}
                        </p>
                      </div>

                      {/* CHANTING FRIENDLY CARD */}
                      <div className="bg-[#F9F7F2] border border-[#E6E2D3] rounded-xl p-4 flex flex-col">
                        <div className="flex justify-between items-center text-[10px] text-[#57534E] font-mono tracking-wider uppercase border-b border-[#E6E2D3] pb-1.5 mb-2 font-bold">
                          <span>English Phonetic (Easy Chanting)</span>
                          <button 
                            onClick={() => handleCopyText(transliterations.phonetic, 'pho')}
                            className="text-[#D97706] hover:text-[#B45309] cursor-pointer"
                          >
                            {copiedText === 'pho' ? <Check className="w-3 h-3 text-green-600 font-bold" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <p className="flex-1 text-[#1C1917] font-serif whitespace-pre-wrap text-xs leading-relaxed">
                          {transliterations.phonetic}
                        </p>
                      </div>

                      {/* SPL1 CARD */}
                      <div className="bg-[#F9F7F2] border border-[#E6E2D3] rounded-xl p-4 flex flex-col">
                        <div className="flex justify-between items-center text-[10px] text-[#0F766E] font-mono tracking-wider uppercase border-b border-[#E6E2D3] pb-1.5 mb-2 font-bold font-semibold">
                          <span>Sanskrit Library Phonetic (SLP1)</span>
                          <button 
                            onClick={() => handleCopyText(transliterations.slp1, 'slp')}
                            className="text-[#D97706] hover:text-[#B45309] cursor-pointer"
                          >
                            {copiedText === 'slp' ? <Check className="w-3 h-3 text-green-600 font-bold" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <p className="flex-1 text-[#115E59] font-mono whitespace-pre-wrap text-xs leading-relaxed tracking-wide font-medium">
                          {transliterations.slp1}
                        </p>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* TAB 4: API Playground Document module */}
                {activeTab === 'api' && (
                  <motion.div
                    key="tab-api"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex-1 flex flex-col"
                  >
                    <ApiPlayground currentText={text} />
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>

      {/* Styled Footer containing API endpoints and credentials instruction info */}
      <footer className="bg-[#F9F7F2] border-t border-[#E6E2D3] mt-12 py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-[#57534E]">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#D97706]">
              <BookOpen className="w-4 h-4" />
              <span className="font-serif font-bold tracking-wider uppercase text-[#1C1917] h-4">Digital Sanatan Archives</span>
            </div>
            <p className="leading-relaxed">
              Vedic translators split classical Sandhi rules of Sanskrit grammar phonetically. This workspace is strictly aligned with classical commentaries from Shankaracharya, Ramanujacharya, and contemporary Indological research.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-serif font-bold text-[#1C1917] tracking-wider uppercase">Active REST Endpoints</h5>
            <ul className="space-y-1.5 font-mono text-[11px] text-[#2D241E]">
              <li className="flex gap-2 items-center">
                <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-[9px] font-bold rounded border border-green-200">POST</span>
                <span>/api/translate</span>
              </li>
              <li className="flex gap-2 items-center">
                <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-[9px] font-bold rounded border border-green-200">POST</span>
                <span>/api/transliterate</span>
              </li>
              <li className="flex gap-2 items-center">
                <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-[9px] font-bold rounded border border-green-200">POST</span>
                <span>/api/analyze</span>
              </li>
              <li className="flex gap-2 items-center">
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-bold rounded border border-blue-200">GET</span>
                <span>/api/scriptures</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-mono text-[#1C1917] uppercase tracking-widest text-[10px] font-bold">API Specifications & Response</h5>
            <p className="leading-relaxed">
              Access scripture translation data in robust JSON formats. Build apps, Slackbots, or websites by utilizing the unified, cross-origin supported Express API system.
            </p>
            <div className="pt-2">
              <span className="text-[10px] bg-[#D97706]/10 border border-[#D97706]/20 text-[#D97706] px-2.5 py-1 rounded-md font-mono inline-block font-semibold">
                Bearer Token Authorized
              </span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-[#E6E2D3] mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-[11px] text-[#78716C] gap-4">
          <p>© 2026 Scriptural Translators Hub. Protected under Apache-2.0 License.</p>
          <div className="flex gap-4">
            <a href="#dev-api-playground" onClick={() => setActiveTab('api')} className="hover:text-[#D97706] transition-colors font-medium">API References</a>
            <span>•</span>
            <a href="#popular-scriptures-bar" className="hover:text-[#D97706] transition-colors font-medium">Sanctified Presets</a>
            <span>•</span>
            <a href="#app-header-section" className="hover:text-[#D97706] transition-colors font-medium">Security Details</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

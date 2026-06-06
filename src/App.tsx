import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Book, 
  Globe, 
  BookOpen, 
  Terminal, 
  AlertCircle
} from 'lucide-react';

import { POPULAR_SCRIPTURES } from './data/scriptures.ts';
import { Scripture, ScriptureAnalyzeResponse, TransliterateResponse } from './types.ts';
import { devanagariToSlp1 } from './utils/transliteration.ts';

// Child components
import Header from './components/Header.tsx';
import PresetScriptures from './components/PresetScriptures.tsx';
import TranslationWorkbench from './components/TranslationWorkbench.tsx';
import TranslationTab from './components/TranslationTab.tsx';
import GrammarTab from './components/GrammarTab.tsx';
import TransliterationTab from './components/TransliterationTab.tsx';
import DictionaryTab from './components/DictionaryTab.tsx';
import ApiPlayground from './components/ApiPlayground.tsx';
import Footer from './components/Footer.tsx';

export default function App() {
  const [text, setText] = useState<string>(POPULAR_SCRIPTURES[0].verse);
  const [sourceLang, setSourceLang] = useState<'sanskrit' | 'hindi' | 'english' | 'auto'>('sanskrit');
  const [targetLang, setTargetLang] = useState<'sanskrit' | 'hindi' | 'english'>('english');
  const [scriptureContext, setScriptureContext] = useState<string>(POPULAR_SCRIPTURES[0].source);
  
  // Tabs for the result workspace
  const [activeTab, setActiveTab] = useState<'translation' | 'grammar' | 'transliteration' | 'api' | 'dictionary'>('translation');
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
      slp1: devanagariToSlp1(sc.verse)
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
        slp1: devanagariToSlp1(data.verse || inputText)
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
        const localSlp = devanagariToSlp1(text);
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
    copiedTextAnim(key);
  };

  const copiedTextAnim = (key: string) => {
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleTranslateWord = (word: string, category: string) => {
    setText(word);
    if (sourceLang === 'hindi' || sourceLang === 'english') {
      setSourceLang('sanskrit');
    }
    setScriptureContext(category);
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
        <Header />

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

        {/* Offline Fallback Active Notification Banner */}
        {analysisResult?.isFallback && (
          <div className="p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-[#78350F] flex items-start gap-3 text-xs leading-relaxed shadow-sm">
            <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5 animate-pulse" />
            <div>
              <span className="font-bold block text-[#92400E] mb-1 font-serif text-sm">🕉️ Offline Scholar Engine Fallback Active</span>
              Live Gemini AI translation quota is currently exhausted or resting. The application has automatically engaged its offline transliterator, rule-based sandhi analyzer, and preloaded Classical scripture corpus. You can still transliterate any text and translate popular matches entirely offline!
            </div>
          </div>
        )}

        {/* SCRIPTURE DOCK: pre-loaded examples click picker */}
        <PresetScriptures 
          scriptureContext={scriptureContext} 
          onSelectScripture={selectScripture} 
        />

        {/* MAIN ROW: Twin splits (Input Workspace Left, Results Console Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Input Control Center (col-span 5) */}
          <div id="input-control-panel" className="lg:col-span-5 space-y-4">
            <TranslationWorkbench
              text={text}
              setText={setText}
              sourceLang={sourceLang}
              setSourceLang={setSourceLang}
              targetLang={targetLang}
              setTargetLang={setTargetLang}
              scriptureContext={scriptureContext}
              setScriptureContext={setScriptureContext}
              isLoading={isLoading}
              onTriggerAnalysis={() => triggerAnalysis(text)}
              onTriggerSimpleTranslation={triggerSimpleTranslation}
              onTriggerPureTransliteration={triggerPureTransliteration}
            />
          </div>

          {/* RIGHT COLUMN: Golden Detailed Results Center (col-span 7) */}
          <div id="results-panel" className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* Header Tabs */}
            <div className="flex bg-[#F5F5F4] border border-[#E6E2D3] p-1 rounded-xl w-full select-none overflow-x-auto">
              
              <button
                onClick={() => setActiveTab('translation')}
                className={`flex-1 min-w-[90px] py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'translation' ? 'bg-white shadow-sm rounded-lg text-[#1C1917] font-bold border border-[#E6E2D3]' : 'text-[#57534E] hover:text-[#D97706]'}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Translation</span>
              </button>

              <button
                onClick={() => setActiveTab('grammar')}
                className={`flex-1 min-w-[90px] py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'grammar' ? 'bg-white shadow-sm rounded-lg text-[#1C1917] font-bold border border-[#E6E2D3]' : 'text-[#57534E] hover:text-[#D97706]'}`}
              >
                <Book className="w-3.5 h-3.5" />
                <span>Padapatha</span>
              </button>

              <button
                onClick={() => setActiveTab('transliteration')}
                className={`flex-1 min-w-[90px] py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'transliteration' ? 'bg-white shadow-sm rounded-lg text-[#1C1917] font-bold border border-[#E6E2D3]' : 'text-[#57534E] hover:text-[#D97706]'}`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Transliteration</span>
              </button>

              <button
                onClick={() => setActiveTab('dictionary')}
                className={`flex-1 min-w-[90px] py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'dictionary' ? 'bg-white shadow-sm rounded-lg text-[#1C1917] font-bold border border-[#E6E2D3]' : 'text-[#57534E] hover:text-[#D97706]'}`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Lexicon</span>
              </button>

              <button
                onClick={() => setActiveTab('api')}
                className={`flex-1 min-w-[90px] py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'api' ? 'bg-white shadow-sm rounded-lg text-[#1C1917] font-bold border border-[#E6E2D3]' : 'text-[#57534E] hover:text-[#D97706]'}`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>APIs</span>
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
                  <TranslationTab
                    analysisResult={analysisResult}
                    leftCardTitle={leftCardTitle}
                    leftCardContent={leftCardContent}
                    leftCardCopyKey={leftCardCopyKey}
                    rightCardTitle={rightCardTitle}
                    rightCardContent={rightCardContent}
                    rightCardCopyKey={rightCardCopyKey}
                    copiedText={copiedText}
                    onCopy={handleCopyText}
                  />
                )}

                {/* TAB 2: Padapatha Grammar elements */}
                {activeTab === 'grammar' && (
                  <GrammarTab analysisResult={analysisResult} />
                )}

                {/* TAB 3: Transliteration Matrix */}
                {activeTab === 'transliteration' && (
                  <TransliterationTab
                    transliterations={transliterations}
                    copiedText={copiedText}
                    onCopy={handleCopyText}
                    onRegenerateMatrix={() => {
                      triggerPureTransliteration('english_phonetic');
                      triggerPureTransliteration('slp1');
                    }}
                  />
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

                {/* TAB 5: Sacred Scripture Lexicon and Specialized Dictionary */}
                {activeTab === 'dictionary' && (
                  <DictionaryTab onTranslateWord={handleTranslateWord} />
                )}

              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>

      {/* Styled Footer containing API endpoints and credentials instruction info */}
      <Footer onTabChange={(tab) => {
        setActiveTab(tab);
        // Scroll to results-panel softly
        document.getElementById('results-panel')?.scrollIntoView({ behavior: 'smooth' });
      }} />

    </div>
  );
}

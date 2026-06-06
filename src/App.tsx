import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Book, 
  Globe, 
  BookOpen, 
  Terminal, 
  AlertCircle,
  Sun,
  Moon,
  Laptop,
  Menu,
  X,
  Compass,
  Database,
  Info,
  Scroll,
  Languages,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

import { POPULAR_SCRIPTURES } from './data/scriptures.ts';
import { Scripture, ScriptureAnalyzeResponse, TransliterateResponse } from './types.ts';
import { devanagariToSlp1 } from './utils/transliteration.ts';

// Child components
import Header from './components/Header.tsx';
import SanskritQuestLogo from './components/SanskritQuestLogo.tsx';
import PresetScriptures from './components/PresetScriptures.tsx';
import TranslationWorkbench from './components/TranslationWorkbench.tsx';
import TranslationTab from './components/TranslationTab.tsx';
import GrammarTab from './components/GrammarTab.tsx';
import TransliterationTab from './components/TransliterationTab.tsx';
import DictionaryTab from './components/DictionaryTab.tsx';
import ApiPlayground from './components/ApiPlayground.tsx';
import Footer from './components/Footer.tsx';
import AboutView from './components/AboutView.tsx';

export default function App() {
  const [text, setText] = useState<string>('');
  const [sourceLang, setSourceLang] = useState<'sanskrit' | 'hindi' | 'english' | 'auto'>('sanskrit');
  const [targetLang, setTargetLang] = useState<'sanskrit' | 'hindi' | 'english'>('english');
  const [scriptureContext, setScriptureContext] = useState<string>('');
  
  // Tabs for the result workspace (when activeNav is 'translator')
  const [activeTab, setActiveTab ] = useState<'translation' | 'grammar' | 'transliteration' | 'api' | 'dictionary'>('translation');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Loading and Error state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Theme support: 'light' | 'dark' | 'system'
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sanskrit-quest-theme');
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    }
    return 'system';
  });
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const settingsRef = useRef<HTMLDivElement>(null);
  const headerTriggerRef = useRef<HTMLButtonElement>(null);
  const sidebarTriggerRef = useRef<HTMLButtonElement>(null);
  const sidebarSettingsContainerRef = useRef<HTMLDivElement>(null);

  // Click outside / Focus shift outside handler for settings popover
  useEffect(() => {
    function handleOutside(event: Event) {
      const target = event.target as HTMLElement;
      if (!isSettingsOpen) return;

      const insideDropdown = settingsRef.current?.contains(target);
      const insideHeaderBtn = headerTriggerRef.current?.contains(target);
      const insideSidebarBtn = sidebarTriggerRef.current?.contains(target);

      if (!insideDropdown && !insideHeaderBtn && !insideSidebarBtn) {
        setIsSettingsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isSettingsOpen) {
        setIsSettingsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('focusin', handleOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('focusin', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSettingsOpen]);

  // Font Size support: 'small' | 'normal' | 'large' | 'xlarge'
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large' | 'xlarge'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sanskrit-quest-fontsize-v3');
      if (stored === 'small' || stored === 'normal' || stored === 'large' || stored === 'xlarge') {
        return stored;
      }
    }
    return 'normal';
  });

  const fontSizes = [
    { id: 'small', label: 'Small', desc: 'Compact layout' },
    { id: 'normal', label: 'Normal', desc: 'Standard Vedic reading' },
    { id: 'large', label: 'Large', desc: 'Comfortable focus' },
    { id: 'xlarge', label: 'Vedic XL', desc: 'Bold word breakdown' }
  ] as const;

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('sanskrit-quest-theme', themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('sanskrit-quest-fontsize-v3', fontSize);
  }, [fontSize]);

  const [isSidebarSettingsExpanded, setIsSidebarSettingsExpanded] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sanskrit-quest-sidebar-settings-expanded');
      if (stored === 'false') return false;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('sanskrit-quest-sidebar-settings-expanded', String(isSidebarSettingsExpanded));
  }, [isSidebarSettingsExpanded]);

  // Click outside / Focus shift outside handler for sidebar settings block
  useEffect(() => {
    function handleOutside(event: Event) {
      const target = event.target as HTMLElement;
      if (!isSidebarSettingsExpanded) return;

      const insideContainer = sidebarSettingsContainerRef.current?.contains(target);

      if (!insideContainer) {
        setIsSidebarSettingsExpanded(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isSidebarSettingsExpanded) {
        setIsSidebarSettingsExpanded(false);
      }
    }

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('focusin', handleOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('focusin', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSidebarSettingsExpanded]);

  const [showResults, setShowResults ] = useState<boolean>(false);
  const [workflowMode, setWorkflowMode ] = useState<'input' | 'readonly'>('input');

  // Left Menu navigation: 'home' | 'translator' | 'lexicon' | 'api' | 'about'
  const [activeNav, setActiveNav] = useState<'home' | 'translator' | 'lexicon' | 'api' | 'about'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Hydrated full analysis/translation state (Preload Bhagavad Gita 2.47)
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

  // Theme auto-detection effect
  useEffect(() => {
    const handleThemeCalculation = () => {
      if (themeMode === 'dark') {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      } else if (themeMode === 'light') {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
      } else {
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(systemPreference);
        if (systemPreference) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    handleThemeCalculation();

    if (themeMode === 'system') {
      const matcher = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      matcher.addEventListener('change', listener);
      return () => matcher.removeEventListener('change', listener);
    }
  }, [themeMode]);

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

    // Auto trigger translation/analysis & route to translator page
    setActiveNav('translator');
    setWorkflowMode('readonly');
    triggerAnalysis(sc.verse, sc.source);
  };

  // Trigger Sanskrit deep analysis API
  const triggerAnalysis = async (inputText: string, ctx?: string) => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setApiError(null);
    setWorkflowMode('readonly');
    setShowResults(true);
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
    setWorkflowMode('readonly');
    setShowResults(true);
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
    setWorkflowMode('readonly');
    setShowResults(true);
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
    setSourceLang('sanskrit');
    setScriptureContext(category);
    setActiveNav('translator');
    setActiveTab('translation');
    triggerAnalysis(word, category);
  };

  // Dynamically compute translation card content
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
    // If either has a "Use target selector" instruction
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

  // Sidebar Layout helper navigation choices
  const navItems = [
    { id: 'home', label: 'Sacred Verses & Presets', shortLabel: 'Verses & Presets', icon: Scroll, description: 'Browse popular verses & presets' },
    { id: 'translator', label: 'Scripture Translator', shortLabel: 'Translator', icon: Languages, description: 'Workspace & sandhi breakdown' },
    { id: 'lexicon', label: 'Sacred Lexicon (Dict)', shortLabel: 'Lexicon', icon: BookOpen, description: 'Theological dictionary query' },
    { id: 'api', label: 'Developer Console', shortLabel: 'Console', icon: Terminal, description: 'REST APIs & sandboxes' },
    { id: 'about', label: 'About Sanskrit Quest', shortLabel: 'About', icon: Compass, description: 'Sanatana Dharma & portal details' }
  ] as const;

  return (
    <div className={`h-screen flex flex-col antialiased transition-colors duration-350 overflow-hidden selection:bg-[#D97706] selection:text-white f-size-${fontSize} ${
      isDark ? 'bg-[#0F0E11] text-[#DFDCE6]' : 'bg-[#FDFBF7] text-[#2D241E]'
    }`}>
      
      {/* 1. GLOBAL WEBPAGE HEADER */}
      <header className={`w-full border-b z-40 sticky top-0 transition-all duration-300 shadow-sm shrink-0 ${
        isDark ? 'bg-[#16151A] border-[#2C2932]' : 'bg-[#F9F7F2] border-[#E6E2D3]'
      }`}>
        <div className="w-full px-4 py-4 md:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 w-full lg:w-auto">
            {/* Collapse/Expand toggle button (Desktop = collapse sidebar, Mobile = toggle menu) */}
            <button 
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                  setIsSidebarCollapsed(prev => !prev);
                } else {
                  setMobileMenuOpen(prev => !prev);
                }
              }}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'hover:bg-[#1E1D23] text-[#F1EFF7]' : 'hover:bg-[#E6E2D3]/30 text-[#1C1917]'
              }`}
              title="Toggle Sidebar Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-red-500" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center justify-center shrink-0">
              <SanskritQuestLogo className="w-11 h-11 md:w-[50px] md:h-[50px]" isDark={isDark} />
            </div>
            <div>
              <h1 className="font-sans text-lg md:text-xl lg:text-2xl font-medium tracking-tight transition-colors flex items-center flex-wrap">
                <span className={isDark ? 'text-[#F1EFF7]' : 'text-[#1C1917]'}>SANSKRIT QUEST</span>
                <span className="text-[#D97706] pl-1.5 font-bold">(संस्कृत अन्वेषणम्)</span>
              </h1>
              <p className={`font-serif text-xs sm:text-sm mt-1.5 font-semibold italic tracking-wide transition-colors leading-relaxed ${
                isDark ? 'text-[#F5E6C4]' : 'text-[#452711]'
              }`}>
                "ॐ असतो मा सद्गमय। तमसो मा ज्योतिर्गमय।" — Lead us from darkness to light.
              </p>
            </div>
          </div>

          {/* Right Block: Scripture engine info + Theme Switcher Dropdown */}
          <div className="flex flex-row items-center gap-3 shrink-0 ml-auto lg:ml-0">
            
            {/* Engine Info Area */}
            <div className={`hidden sm:flex flex-col items-end gap-0.5 text-right p-2 px-3 rounded-xl border transition-all duration-300 ${
              isDark 
                ? 'bg-[#1D1C22] border-[#2C2932]' 
                : 'bg-white border-[#E6E2D3]'
            }`}>
              <div className="flex items-center gap-1 text-[11px]">
                <Compass className="w-3.5 h-3.5 text-[#D97706] animate-pulse" />
                <span className={`font-bold ${isDark ? 'text-[#E5E3DB]' : 'text-[#1C1917]'}`}>Sanskrit • Hindi • English</span>
              </div>
              <p className={`text-[9px] font-mono leading-tight ${isDark ? 'text-[#9B98A3]' : 'text-[#78716C]'}`}>
                Vedic parsing engine powered by Gemini AI
              </p>
            </div>

            {/* About Navigation Link */}
            <button
              onClick={() => setActiveNav('about')}
              className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0 h-10 w-10 ${
                activeNav === 'about'
                  ? 'bg-[#D97706] text-white border-[#D97706]'
                  : isDark
                    ? 'bg-[#201F25] text-[#F1EFF7] border-[#2C2932] hover:bg-[#2C2B32]'
                    : 'bg-white text-[#1C1917] border-[#E6E2D3] hover:bg-[#F9F7F2]'
              }`}
              title="About Portal"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Unified Settings Trigger Dropdown */}
            <div className="relative shrink-0">
              <button
                ref={headerTriggerRef}
                onClick={() => setIsSettingsOpen(prev => !prev)}
                className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-sm h-10 w-10 ${
                  isSettingsOpen
                    ? 'bg-[#D97706] text-white border-[#D97706]'
                    : isDark 
                      ? 'bg-[#201F25] text-amber-200 border-[#2C2932] hover:bg-[#2C2B32]' 
                      : 'bg-white text-[#1C1917] border-[#E6E2D3] hover:bg-[#F9F7F2]'
                }`}
                title="Scholar Settings"
              >
                <Settings className={`w-4 h-4 ${isSettingsOpen ? 'text-white' : 'text-[#D97706]'}`} />
              </button>

              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    ref={settingsRef}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className={`absolute right-0 mt-2 w-72 rounded-2xl border p-4 shadow-xl z-50 transition-all ${
                      isDark ? 'bg-[#1C1B20] border-[#2E2C33]' : 'bg-white border-[#E6E2D3]'
                    }`}
                  >
                      {/* Header Title */}
                      <div className="flex items-center gap-2 mb-3 border-b pb-2 border-[#E6E2D3]/60 dark:border-[#2C2932]">
                        <Settings className="w-4 h-4 text-[#D97706]" />
                        <h4 className="font-serif font-bold text-xs text-amber-600 dark:text-amber-500">Vedic Workspace Settings</h4>
                      </div>

                      {/* Theme Settings */}
                      <div className="mb-4">
                        <span className={`text-[10px] font-mono uppercase tracking-widest font-bold opacity-70 block mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Interface Theme
                        </span>
                        <div className="grid grid-cols-3 gap-1 rounded-lg border border-[#E6E2D3] dark:border-[#2C2932] p-0.5 bg-[#FAF8F4] dark:bg-[#100F12]">
                          {(['light', 'dark', 'system'] as const).map((mode) => {
                            const isSelected = themeMode === mode;
                            let ModeIcon = Sun;
                            if (mode === 'dark') ModeIcon = Moon;
                            if (mode === 'system') ModeIcon = Laptop;
                            return (
                              <button
                                key={`settings-theme-${mode}`}
                                onClick={() => setThemeMode(mode)}
                                className={`py-1.5 px-2 text-[10px] font-semibold rounded flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#D97706] text-white shadow-sm font-bold'
                                    : isDark
                                      ? 'text-[#A19E95] hover:bg-[#25242D] hover:text-[#F1EFF7]'
                                      : 'text-[#57534E] hover:bg-[#E6E2D3]/40 hover:text-[#1C1917]'
                                }`}
                              >
                                <ModeIcon className="w-3.5 h-3.5" />
                                <span className="capitalize">{mode}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Font-Size Settings */}
                      <div className="mb-1">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className={`text-[10px] font-mono uppercase tracking-widest font-bold opacity-70 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            Workspace Font Size
                          </span>
                          <span className="text-[9px] font-serif font-black text-[#D97706] bg-amber-500/10 px-1.5 py-0.5 rounded">
                            {fontSize === 'small' ? 'Compact' : fontSize === 'normal' ? 'Scholar' : fontSize === 'large' ? 'Sadhana' : 'Deva XL'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-1 rounded-lg border border-[#E6E2D3] dark:border-[#2C2932] p-0.5 bg-[#FAF8F4] dark:bg-[#100F12]">
                          {fontSizes.map((opt) => {
                            const isSelected = fontSize === opt.id;
                            return (
                              <button
                                key={`settings-font-${opt.id}`}
                                onClick={() => setFontSize(opt.id)}
                                className={`py-1.5 text-[11px] font-serif font-black rounded flex flex-col items-center justify-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#D97706] text-white shadow-sm'
                                    : isDark
                                      ? 'text-[#A19E95] hover:bg-[#25242D] hover:text-[#F1EFF7]'
                                      : 'text-[#57534E] hover:bg-[#E6E2D3]/40 hover:text-[#1C1917]'
                                }`}
                                title={opt.desc}
                              >
                                <span className={opt.id === 'small' ? 'text-[9px]' : opt.id === 'normal' ? 'text-[11px]' : opt.id === 'large' ? 'text-xs' : 'text-sm'}>
                                  A
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>



          </div>

        </div>
      </header>

      {/* 2. BODY ROW LAYOUT CONTAINER */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
        
        {/* DESKTOP PERSISTENT SIDEBAR */}
        <aside className={`hidden md:flex flex-col ${isSidebarCollapsed ? 'w-20 overflow-visible' : 'w-72 overflow-y-auto'} border-r h-full shrink-0 transition-all duration-300 shadow-sm ${
          isDark ? 'bg-[#16151A] border-[#2C2932]' : 'bg-[#F9F7F2] border-[#E6E2D3]'
        }`}>
          <div className={`${isSidebarCollapsed ? 'pt-0 px-3 pb-3' : 'pt-0 px-6 pb-6'} flex flex-col justify-between min-h-full`}>
            <div>
              {/* Branding Header */}
              <div className="flex flex-col items-center justify-center text-center pt-[10px] pb-[10px] mb-1.5 transition-all duration-300">
                {!isSidebarCollapsed ? (
                  <div className="flex items-center justify-center shrink-0">
                    <SanskritQuestLogo className="w-36 h-36" isDark={isDark} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center shrink-0">
                    <SanskritQuestLogo className="w-10 h-10" isDark={isDark} />
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                {!isSidebarCollapsed && (
                  <span className={`text-[9px] font-mono block tracking-widest uppercase font-black px-2.5 mb-2 ${isDark ? 'text-[#726E7A]' : 'text-[#78716C]'}`}>
                    Core Navigation
                  </span>
                )}
                {navItems.map((item) => {
                  const isActive = activeNav === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={`desktop-nav-${item.id}`}
                      onClick={() => {
                        setActiveNav(item.id);
                        if (item.id === 'translator') {
                          setWorkflowMode('input');
                          setShowResults(false);
                          setText('');
                          setScriptureContext('');
                          setSourceLang('sanskrit');
                          setTargetLang('english');
                        }
                      }}
                      className={`relative group w-full transition-all cursor-pointer rounded-xl flex ${
                        isSidebarCollapsed 
                          ? 'flex-col items-center justify-center p-2.5 gap-1.5 text-center' 
                          : 'items-start gap-4 p-3 text-left'
                      } ${
                        isActive 
                          ? 'bg-[#D97706] text-white font-semibold shadow-sm' 
                          : isDark
                            ? 'text-[#A19E95] hover:bg-[#1E1D23] hover:text-[#F1EFF7]'
                            : 'text-[#57534E] hover:bg-[#E6E2D3]/30 hover:text-[#1C1917]'
                      }`}
                    >
                      <Icon 
                        className={`shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                          isSidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4 mt-0.5'
                        } ${isActive ? 'text-white' : 'text-[#D97706]'}`}
                        fill={isActive ? 'currentColor' : 'none'}
                      />
                      
                      {isSidebarCollapsed ? (
                        <span className="text-[9px] font-serif tracking-tight leading-none block whitespace-nowrap overflow-hidden text-ellipsis w-full">
                          {item.shortLabel}
                        </span>
                      ) : (
                        <div className="min-w-0 flex-1">
                          <span className="text-xs leading-none block">{item.label}</span>
                          <span className={`text-[10px] block mt-1 font-normal leading-tight opacity-80 ${isActive ? 'text-orange-100' : 'text-[#78716C]'}`}>
                            {item.description}
                          </span>
                        </div>
                      )}

                      {/* Floating tooltip when collapsed */}
                      {isSidebarCollapsed && (
                        <div className={`pointer-events-none absolute left-[86px] top-1/2 -translate-y-1/2 z-50 rounded-lg px-3 py-1.5 text-[10px] font-sans text-left whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md border ${
                          isDark ? 'bg-[#1C1B20] text-amber-100 border-[#2C2932]' : 'bg-white text-[#1C1917] border-[#E6E2D3]'
                        }`}>
                          <div className="font-bold font-serif">{item.label}</div>
                          <div className={`text-[9px] font-normal opacity-75 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.description}</div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Bottom Integrated Settings Block */}
            {!isSidebarCollapsed ? (
              <div ref={sidebarSettingsContainerRef} className="border-t pt-4 border-[#E6E2D3] dark:border-[#2C2932] mt-auto">
                <button
                  onClick={() => setIsSidebarSettingsExpanded(prev => !prev)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer text-left mb-2 outline-none group ${
                    isDark 
                      ? 'hover:bg-[#201F25]/85 text-amber-200' 
                      : 'hover:bg-[#FAF8F4]/80 text-[#1C1917]'
                  }`}
                  title={isSidebarSettingsExpanded ? "Click to collapse scholar settings" : "Click to expand scholar settings"}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#D97706]" />
                    <span className="text-[10.5px] font-mono tracking-widest uppercase font-black text-amber-600 dark:text-amber-500">Scholar Settings</span>
                  </div>
                  {isSidebarSettingsExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#D97706]" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[#D97706]" />
                  )}
                </button>
                
                <AnimatePresence initial={false}>
                  {isSidebarSettingsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {/* Theme Block */}
                      <div className="mb-3.5 px-1 pt-1">
                        <span className="text-[9.5px] font-mono uppercase tracking-widest block mb-1 opacity-70">Interface Theme</span>
                        <div className="grid grid-cols-3 gap-1 rounded-lg border border-[#E6E2D3] dark:border-[#2C2932] p-0.5 bg-[#FAF8F4] dark:bg-[#1C1A20]">
                          {(['light', 'dark', 'system'] as const).map((mode) => {
                            const isSelected = themeMode === mode;
                            let ModeIcon = Sun;
                            if (mode === 'dark') ModeIcon = Moon;
                            if (mode === 'system') ModeIcon = Laptop;
                            return (
                              <button
                                key={`sidebar-theme-${mode}`}
                                onClick={() => setThemeMode(mode)}
                                className={`py-1 text-[11px] font-semibold rounded flex flex-col items-center gap-0.5 justify-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#D97706] text-white shadow-sm font-bold'
                                    : isDark
                                      ? 'text-[#A19E95] hover:bg-[#25242D]'
                                      : 'text-[#57534E] hover:bg-[#E6E2D3]/40'
                                }`}
                              >
                                <ModeIcon className="w-3 h-3 shrink-0" />
                                <span className="capitalize text-[9px]">{mode}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Font Size Block */}
                      <div className="px-1 pb-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9.5px] font-mono uppercase tracking-widest block opacity-70">Font Size</span>
                          <span className="text-[9px] font-serif font-black text-[#D97706] bg-amber-500/10 px-1 py-0.25 rounded">
                            {fontSize === 'small' ? 'Compact' : fontSize === 'normal' ? 'Scholar' : fontSize === 'large' ? 'Sadhana' : 'Deva XL'}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 rounded-lg border border-[#E6E2D3] dark:border-[#2C2932] p-0.5 bg-[#FAF8F4] dark:bg-[#1C1A20]">
                          {fontSizes.map((opt) => {
                            const isSelected = fontSize === opt.id;
                            return (
                              <button
                                key={`sidebar-font-${opt.id}`}
                                onClick={() => setFontSize(opt.id)}
                                className={`py-1.5 text-[11px] font-serif font-black rounded flex flex-col items-center justify-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#D97706] text-white shadow-sm'
                                    : isDark
                                      ? 'text-[#A19E95] hover:bg-[#25242D]'
                                      : 'text-[#57534E] hover:bg-[#E6E2D3]/40'
                                }`}
                                title={opt.desc}
                              >
                                <span className={opt.id === 'small' ? 'text-[9px]' : opt.id === 'normal' ? 'text-xs' : opt.id === 'large' ? 'text-sm' : 'text-base'}>A</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Collapsed Sidebar: quiet settings button */
              <div className="flex flex-col items-center justify-center border-t pt-4 border-[#E6E2D3] dark:border-[#2C2932] mt-auto">
                <button
                  ref={sidebarTriggerRef}
                  onClick={() => setIsSettingsOpen(prev => !prev)}
                  className={`relative group p-2.5 rounded-xl transition-all cursor-pointer ${
                    isSettingsOpen
                      ? 'bg-[#D97706] text-white shadow-sm'
                      : isDark
                        ? 'text-[#A19E95] hover:bg-[#1E1D23] hover:text-[#F1EFF7]'
                        : 'text-[#57534E] hover:bg-[#E6E2D3]/30 hover:text-[#1C1917]'
                  }`}
                  title="Scholar Settings"
                >
                  <Settings className={`w-5 h-5 ${isSettingsOpen ? 'text-white' : 'text-[#D97706]'}`} />
                  {/* Floating tooltip */}
                  <div className={`pointer-events-none absolute left-[86px] top-1/2 -translate-y-1/2 z-50 rounded-lg px-3 py-1.5 text-[10px] font-sans text-left whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md border ${
                    isDark ? 'bg-[#1C1B20] text-amber-100 border-[#2C2932]' : 'bg-white text-[#1C1917] border-[#E6E2D3]'
                  }`}>
                    <div className="font-bold font-serif">Scholar Settings</div>
                    <div className={`text-[9px] font-normal opacity-75 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Adjust typography & themes</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* MOBILE OVERLAY NAVIGATION DRAWER */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ type: 'spring', damping: 20 }}
                className={`fixed inset-y-0 left-0 w-64 pt-20 pb-6 px-4 z-30 border-r flex flex-col justify-between md:hidden transition-colors ${
                  isDark ? 'bg-[#16151A] border-[#2B2831]' : 'bg-[#F9F7F2] border-[#E6E2D3]'
                }`}
              >
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <span className={`text-[9px] font-mono block tracking-widest uppercase font-black px-2 ${isDark ? 'text-[#726E7A]' : 'text-gray-400'}`}>
                      Navigation Menu
                    </span>
                    {navItems.map((item) => {
                      const isActive = activeNav === item.id;
                      const Icon = item.icon;
                      return (
                        <button
                          key={`mobile-nav-${item.id}`}
                          onClick={() => {
                            setActiveNav(item.id);
                            setMobileMenuOpen(false);
                            if (item.id === 'translator') {
                              setWorkflowMode('input');
                              setShowResults(false);
                              setText('');
                              setScriptureContext('');
                              setSourceLang('sanskrit');
                              setTargetLang('english');
                            }
                          }}
                          className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors cursor-pointer ${
                            isActive 
                              ? 'bg-[#D97706] text-white font-bold shadow-sm' 
                              : isDark
                                ? 'text-[#A19E95] hover:bg-[#1E1D23] hover:text-[#F1EFF7]'
                                : 'text-[#57534E] hover:bg-[#E6E2D3]/30 hover:text-[#1C1917]'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 col-span-1 ${isActive ? 'text-white' : 'text-[#D97706]'}`} />
                          <div>
                            <span className="text-xs font-semibold block">{item.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile settings integrated */}
                <div className="border-t pt-4 border-[#E6E2D3]/60 dark:border-[#2C2932] mt-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="w-4 h-4 text-[#D97706]" />
                    <span className="text-[10px] font-mono tracking-widest uppercase font-black text-amber-600 dark:text-amber-500">Scholar Settings</span>
                  </div>
                  
                  {/* Theme select (Mobile) */}
                  <div className="mb-3.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest block mb-1 opacity-70">Interface Theme</span>
                    <div className="grid grid-cols-3 gap-1 rounded-lg border border-[#E6E2D3] dark:border-[#2C2932] p-0.5 bg-[#FAF8F4] dark:bg-[#100F12]">
                      {(['light', 'dark', 'system'] as const).map((mode) => {
                        const isSelected = themeMode === mode;
                        let ModeIcon = Sun;
                        if (mode === 'dark') ModeIcon = Moon;
                        if (mode === 'system') ModeIcon = Laptop;
                        return (
                          <button
                            key={`mobile-theme-${mode}`}
                            onClick={() => {
                              setThemeMode(mode);
                            }}
                            className={`py-1 text-[10px] font-semibold rounded flex flex-col items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#D97706] text-white shadow-sm font-bold'
                                : isDark
                                  ? 'text-[#A19E95] hover:bg-[#25242D]'
                                  : 'text-[#57534E] hover:bg-[#E6E2D3]/40'
                            }`}
                          >
                            <ModeIcon className="w-3.5 h-3.5 mb-0.5" />
                            <span className="capitalize">{mode}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Font Size select (Mobile) */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest block opacity-70">Font Size</span>
                      <span className="text-[9px] font-serif font-black text-[#D97706] bg-amber-500/10 px-1 py-0.25 rounded">
                        {fontSize === 'small' ? 'Compact' : fontSize === 'normal' ? 'Scholar' : fontSize === 'large' ? 'Sadhana' : 'Deva XL'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 rounded-lg border border-[#E6E2D3] dark:border-[#2C2932] p-0.5 bg-[#FAF8F4] dark:bg-[#100F12]">
                      {fontSizes.map((opt) => {
                        const isSelected = fontSize === opt.id;
                        return (
                          <button
                            key={`mobile-font-${opt.id}`}
                            onClick={() => {
                              setFontSize(opt.id);
                            }}
                            className={`py-1.5 text-[11px] font-serif font-black rounded flex flex-col items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#D97706] text-white shadow-sm'
                                : isDark
                                  ? 'text-[#A19E95] hover:bg-[#25242D]'
                                  : 'text-[#57534E] hover:bg-[#E6E2D3]/40'
                            }`}
                          >
                            <span className={opt.id === 'small' ? 'text-[9px]' : opt.id === 'normal' ? 'text-xs' : opt.id === 'large' ? 'text-sm' : 'text-base'}>A</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 3. MAIN WORKSPACE CONTENT WINDOW */}
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto transition-colors duration-350">
          
          {/* Decorative Golden Top boundary strip */}
          <div className="h-1 w-full bg-[#D97706] shrink-0 shadow-sm" />

          <div className="flex-1 w-full max-w-full lg:max-w-[96%] mx-auto px-4 py-6 md:px-8 md:py-8 flex flex-col space-y-6">
            
            {/* Active Navigation Workspace router */}
            <AnimatePresence mode="wait">
              
              {/* Nav View 0: Home Curated Presets */}
              {activeNav === 'home' && (
                <motion.div
                  key="workspace-home"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 border-b pb-4 mb-4 border-[#E6E2D3] dark:border-[#2C2932]">
                    <Scroll className="w-5 h-5 text-[#D97706]" />
                    <h3 className="font-serif text-lg font-bold">Sacred Verses & Presets</h3>
                  </div>
                  <PresetScriptures 
                    scriptureContext={scriptureContext} 
                    onSelectScripture={selectScripture} 
                    isDark={isDark}
                  />
                </motion.div>
              )}

            {/* Nav View 1: Main Scripture Translation Workbench */}
            {activeNav === 'translator' && (
              <motion.div
                key="workspace-translator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 border-b pb-4 mb-4 border-[#E6E2D3] dark:border-[#2C2932]">
                  <Languages className="w-5 h-5 text-[#D97706]" />
                  <h3 className="font-serif text-lg font-bold">Scripture Translator</h3>
                </div>

                {/* Local & Offline Vedic Scholar Engine announcement */}
                {showResults && !analysisResult?.isFallback && (
                  <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed transition-all duration-300 ${
                    isDark 
                      ? 'bg-[#1D1C22]/80 border-[#2D2A35]/60 text-[#DFDCE6]' 
                      : 'bg-[#FAF8F4] border-[#E8E4D7] text-[#2D241E]'
                  }`}>
                    <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5 animate-pulse" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold font-serif text-sm text-[#D97706]">🕉️ Offline Vedic Scholar Engine Active & Ready</span>
                        <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                          isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          Status: Fully Operational
                        </span>
                      </div>
                      <p className={`text-xs leading-normal ${isDark ? 'text-[#9B98A3]' : 'text-[#78716C]'}`}>
                        Classical Sanskrit archives, rule-based sandhi parsing, and scriptural transliterators are fully available locally. Multi-lingual translation requests will automatically leverage the Gemini AI model if online mode is actively selected.
                      </p>
                    </div>
                  </div>
                )}

                {/* Secret Key Validation warning */}
                {apiError && apiError.includes("GEMINI_API_KEY") && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/30 rounded-xl text-red-800 dark:text-red-300 flex items-start gap-3 text-xs leading-relaxed">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-1">Secrets Configuration Required</span>
                      Your Sanskrit translation services are currently running in secure API proxy mode. To perform live translations via Gemini in Cloud Run, go to **Settings &gt; Secrets** panel in the AI Studio UI and enter your <code className="bg-red-500/10 dark:bg-red-500/20 px-1 py-0.5 rounded font-mono border border-red-500/10">GEMINI_API_KEY</code>.
                    </div>
                  </div>
                )}

                {/* Fallback Engine alert */}
                {showResults && analysisResult?.isFallback && (
                  <div className="p-4 bg-[#FFFBEB] dark:bg-amber-950/10 border border-[#FDE68A] dark:border-amber-500/20 rounded-xl text-[#78350F] dark:text-amber-300 flex items-start gap-3 text-xs leading-relaxed shadow-sm">
                    <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <span className="font-bold block mb-1 font-serif text-sm">🕉️ Offline Scholar Engine Fallback Active</span>
                      Live Gemini AI translation quota is currently resting. The application has automatically engaged its offline transliterator, rule-based sandhi analyzer, and preloaded Classical scripture corpus. You can still transliterate any text and translate popular matches entirely offline!
                    </div>
                  </div>
                )}

                {/* Input Workbench and Result Workspace - Rendered as a stacked full-width layout */}
                <div className="flex flex-col space-y-8">
                  
                  {/* Full Width Translation workbench */}
                  <div id="workspace-triggers" className="w-full">
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
                      isDark={isDark}
                      workflowMode={workflowMode}
                      setWorkflowMode={(mode) => {
                        setWorkflowMode(mode);
                        if (mode === 'input') {
                          setShowResults(false);
                        } else {
                          setShowResults(true);
                        }
                      }}
                    />
                  </div>

                  {/* Complete Results Console - Rendered below occupying full width, shown only after button triggers */}
                  <AnimatePresence>
                    {showResults && (
                      <motion.div
                        id="results-panel"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="w-full flex flex-col space-y-4 scroll-mt-6"
                      >
                        {/* Console Tab selectors */}
                        <div className={`flex p-1 rounded-xl w-full select-none overflow-x-auto border transition-colors ${
                          isDark ? 'bg-[#151419] border-[#2C2932]' : 'bg-[#F5F5F4] border-[#E6E2D3]'
                        }`}>
                          <button
                            onClick={() => setActiveTab('translation')}
                            className={`flex-1 min-w-[90px] py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                              activeTab === 'translation' 
                                ? isDark
                                  ? 'bg-[#25242D] shadow-sm text-amber-500 border border-[#2C2932]'
                                  : 'bg-white shadow-sm text-[#1C1917] font-bold border border-[#E6E2D3]' 
                                : 'text-[#78716C] hover:text-[#D97706]'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Translation</span>
                          </button>

                          <button
                            onClick={() => setActiveTab('grammar')}
                            className={`flex-1 min-w-[90px] py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                              activeTab === 'grammar' 
                                ? isDark
                                  ? 'bg-[#25242D] shadow-sm text-amber-500 border border-[#2C2932]'
                                  : 'bg-white shadow-sm text-[#1C1917] font-bold border border-[#E6E2D3]' 
                                : 'text-[#78716C] hover:text-[#D97706]'
                            }`}
                          >
                            <Book className="w-3.5 h-3.5" />
                            <span>Padapatha</span>
                          </button>

                          <button
                            onClick={() => setActiveTab('transliteration')}
                            className={`flex-1 min-w-[90px] py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                              activeTab === 'transliteration' 
                                ? isDark
                                  ? 'bg-[#25242D] shadow-sm text-amber-500 border border-[#2C2932]'
                                  : 'bg-white shadow-sm text-[#1C1917] font-bold border border-[#E6E2D3]' 
                                : 'text-[#78716C] hover:text-[#D97706]'
                            }`}
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span>Transliteration</span>
                          </button>
                        </div>

                        {/* Results Outer Content Box */}
                        <div className={`border rounded-2xl p-5 min-h-[380px] flex flex-col relative overflow-hidden shadow-sm transition-colors ${
                          isDark ? 'bg-[#16151A] border-[#2C2932]' : 'bg-white border-[#E6E2D3]'
                        }`}>
                          <AnimatePresence mode="wait">
                            {isLoading && (
                              <div className={`absolute inset-0 z-25 flex flex-col items-center justify-center space-y-3 transition-all ${
                                isDark ? 'bg-[#0F0E11]/90' : 'bg-white/80'
                              }`}>
                                <span className="w-9 h-9 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm font-serif text-[#D97706] font-bold">Deconstructing Sandhi Rules & Vedic commentaries...</p>
                                <p className="text-[10px] font-mono text-[#78716C] tracking-widest">Model parameters synced</p>
                              </div>
                            )}

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
                                isDark={isDark}
                              />
                            )}

                            {activeTab === 'grammar' && (
                              <GrammarTab analysisResult={analysisResult} isDark={isDark} />
                            )}

                            {activeTab === 'transliteration' && (
                              <TransliterationTab
                                transliterations={transliterations}
                                copiedText={copiedText}
                                onCopy={handleCopyText}
                                onRegenerateMatrix={() => {
                                  triggerPureTransliteration('english_phonetic');
                                  triggerPureTransliteration('slp1');
                                }}
                                isDark={isDark}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </motion.div>
            )}

            {/* Nav View 2: Sacred Scripture Lexicon Search Panel */}
            {activeNav === 'lexicon' && (
              <motion.div
                key="workspace-lexicon"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 border-b pb-4 mb-4 border-[#E6E2D3] dark:border-[#2C2932]">
                  <BookOpen className="w-5 h-5 text-[#D97706]" />
                  <h3 className="font-serif text-lg font-bold">Sacred Lexicon (Dict)</h3>
                </div>
                <DictionaryTab onTranslateWord={handleTranslateWord} isDark={isDark} />
              </motion.div>
            )}

            {/* Nav View 3: Developer specs and Sandbox console */}
            {activeNav === 'api' && (
              <motion.div
                key="workspace-api"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 border-b pb-4 mb-4 border-[#E6E2D3] dark:border-[#2C2932]">
                  <Terminal className="w-5 h-5 text-[#D97706]" />
                  <h3 className="font-serif text-lg font-bold">Developer Console</h3>
                </div>
                <ApiPlayground currentText={text} isDark={isDark} />
              </motion.div>
            )}

            {/* Nav View 4: About information portal */}
            {activeNav === 'about' && (
              <motion.div
                key="workspace-about"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 border-b pb-4 mb-4 border-[#E6E2D3] dark:border-[#2C2932]">
                  <Compass className="w-5 h-5 text-[#D97706]" />
                  <h3 className="font-serif text-lg font-bold">About Sanskrit Quest</h3>
                </div>
                <AboutView isDark={isDark} />
              </motion.div>
            )}

          </AnimatePresence>

        </div>

        {/* Global Themed Footer */}
        <Footer 
          onTabChange={(tab) => {
            setActiveNav('translator');
            setActiveTab(tab);
            setTimeout(() => {
              document.getElementById('results-panel')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }} 
          isDark={isDark}
        />

      </main>
      </div>

    </div>
  );
}

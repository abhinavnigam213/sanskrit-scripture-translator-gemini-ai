import React from 'react';
import { Trash2, RefreshCw, Sparkles, Globe, FileCode, HelpCircle } from 'lucide-react';

interface TranslationWorkbenchProps {
  text: string;
  setText: (text: string) => void;
  sourceLang: 'sanskrit' | 'hindi' | 'english' | 'auto';
  setSourceLang: (lang: 'sanskrit' | 'hindi' | 'english' | 'auto') => void;
  targetLang: 'sanskrit' | 'hindi' | 'english';
  setTargetLang: (lang: 'sanskrit' | 'hindi' | 'english') => void;
  scriptureContext: string;
  setScriptureContext: (ctx: string) => void;
  isLoading: boolean;
  onTriggerAnalysis: () => void;
  onTriggerSimpleTranslation: () => void;
  onTriggerPureTransliteration: (target: 'iast' | 'itrans' | 'english_phonetic' | 'devanagari' | 'slp1') => void;
}

export default function TranslationWorkbench({
  text,
  setText,
  sourceLang,
  setSourceLang,
  targetLang,
  setTargetLang,
  scriptureContext,
  setScriptureContext,
  isLoading,
  onTriggerAnalysis,
  onTriggerSimpleTranslation,
  onTriggerPureTransliteration,
}: TranslationWorkbenchProps) {
  return (
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
          className="bg-white border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs text-[#1C1917] font-serif placeholder:font-sans placeholder:text-[#A8A29E] shadow-sm"
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
          onClick={onTriggerAnalysis}
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
            onClick={onTriggerSimpleTranslation}
            disabled={isLoading || !text.trim()}
            className="py-2.5 px-3 bg-white border border-[#E6E2D3] text-[#57534E] hover:text-[#D97706] hover:bg-[#F9F7F2] rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Direct Translation</span>
          </button>

          <button
            onClick={() => onTriggerPureTransliteration('iast')}
            disabled={isLoading || !text.trim()}
            className="py-2.5 px-3 bg-white border border-[#E6E2D3] text-[#57534E] hover:text-[#D97706] hover:bg-[#F9F7F2] rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Build diacritics (IAST)</span>
          </button>

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
          <p><strong>SLP1</strong> (Sanskrit Library Phonetic Basic Scheme) is an ASCII-only encoding mapping each distinctive Sanskrit speech sound to a single keyboard character.</p>
        </div>
      </div>

    </div>
  );
}

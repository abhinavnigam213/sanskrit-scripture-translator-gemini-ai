import React from 'react';
import { motion } from 'motion/react';
import { Copy, Check } from 'lucide-react';

interface Transliterations {
  devanagari: string;
  iast: string;
  itrans: string;
  phonetic: string;
  slp1: string;
}

interface TransliterationTabProps {
  transliterations: Transliterations;
  copiedText: string | null;
  onCopy: (content: string, key: string) => void;
  onRegenerateMatrix: () => void;
}

export default function TransliterationTab({
  transliterations,
  copiedText,
  onCopy,
  onRegenerateMatrix,
}: TransliterationTabProps) {
  return (
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
              onClick={onRegenerateMatrix}
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
              onClick={() => onCopy(transliterations.devanagari, 'dev')}
              className="text-[#D97706] hover:text-[#B45309] cursor-pointer"
            >
              {copiedText === 'dev' ? <Check className="w-3.5 h-3.5 text-green-600 font-bold" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="flex-1 text-[#1C1917] font-serif whitespace-pre-wrap text-sm leading-relaxed antialiased">
            {transliterations.devanagari}
          </p>
        </div>

        {/* IAST CARD */}
        <div className="bg-[#F9F7F2] border border-[#E6E2D3] rounded-xl p-4 flex flex-col">
          <div className="flex justify-between items-center text-[10px] text-[#1C1917] font-mono tracking-wider uppercase border-b border-[#E6E2D3] pb-1.5 mb-2 font-bold font-semibold">
            <span>IAST (Academic Diacritics)</span>
            <button 
              onClick={() => onCopy(transliterations.iast, 'ias')}
              className="text-[#D97706] hover:text-[#B45309] cursor-pointer"
            >
              {copiedText === 'ias' ? <Check className="w-3.5 h-3.5 text-green-600 font-bold" /> : <Copy className="w-3.5 h-3.5" />}
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
              onClick={() => onCopy(transliterations.itrans, 'itr')}
              className="text-[#D97706] hover:text-[#B45309] cursor-pointer"
            >
              {copiedText === 'itr' ? <Check className="w-3.5 h-3.5 text-green-600 font-bold" /> : <Copy className="w-3.5 h-3.5" />}
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
              onClick={() => onCopy(transliterations.phonetic, 'pho')}
              className="text-[#D97706] hover:text-[#B45309] cursor-pointer"
            >
              {copiedText === 'pho' ? <Check className="w-3.5 h-3.5 text-green-600 font-bold" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="flex-1 text-[#1C1917] font-serif whitespace-pre-wrap text-xs leading-relaxed">
            {transliterations.phonetic}
          </p>
        </div>

        {/* SLP1 CARD */}
        <div className="bg-[#F9F7F2] border border-[#E6E2D3] rounded-xl p-4 flex flex-col">
          <div className="flex justify-between items-center text-[10px] text-[#0F766E] font-mono tracking-wider uppercase border-b border-[#E6E2D3] pb-1.5 mb-2 font-bold">
            <span>Sanskrit Library Phonetic (SLP1)</span>
            <button 
              onClick={() => onCopy(transliterations.slp1, 'slp')}
              className="text-[#D97706] hover:text-[#B45309] cursor-pointer"
            >
              {copiedText === 'slp' ? <Check className="w-3.5 h-3.5 text-green-600 font-bold" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="flex-1 text-[#115E59] font-mono whitespace-pre-wrap text-xs leading-relaxed tracking-wide font-medium">
            {transliterations.slp1}
          </p>
        </div>

      </div>
    </motion.div>
  );
}

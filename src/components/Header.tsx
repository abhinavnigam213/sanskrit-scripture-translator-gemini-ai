import React from 'react';
import { BookOpen, Compass } from 'lucide-react';

export default function Header() {
  return (
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
  );
}

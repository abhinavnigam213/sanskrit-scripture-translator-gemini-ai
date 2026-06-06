import React from 'react';
import { Compass } from 'lucide-react';
import { POPULAR_SCRIPTURES } from '../data/scriptures.ts';
import { Scripture } from '../types.ts';

interface PresetScripturesProps {
  scriptureContext: string;
  onSelectScripture: (sc: Scripture) => void;
}

export default function PresetScriptures({ scriptureContext, onSelectScripture }: PresetScripturesProps) {
  return (
    <section id="popular-scriptures-bar" className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        <Compass className="w-3.5 h-3.5 text-[#D97706]" />
        <h2 className="text-xs font-mono uppercase tracking-widest text-[#78716C] font-semibold">
          Browse Sanctified Verses / Popular Presets
        </h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {POPULAR_SCRIPTURES.map((sc) => {
          const isSelected = scriptureContext === sc.source;
          return (
            <button
              key={sc.id}
              onClick={() => onSelectScripture(sc)}
              className={`flex-shrink-0 text-left p-3.5 w-64 md:w-72 rounded-xl border transition-all duration-300 cursor-pointer ${
                isSelected 
                  ? 'bg-white border-[#D97706] shadow-sm text-[#1C1917]' 
                  : 'bg-[#F9F7F2] border-[#E6E2D3] hover:bg-[#E6E2D3]/20 hover:border-[#D97706]/40 text-[#44403C]'
              }`}
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
  );
}

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { SPECIALIZED_SCRIPTURE_DICT } from '../../server/dictionaries.ts';

interface DictionaryTabProps {
  onTranslateWord: (word: string, category: string) => void;
}

type CategoryType = 'All' | 'Vedas' | 'Upanishads' | 'Gita' | 'Ramayana' | 'Puranas';

export default function DictionaryTab({ onTranslateWord }: DictionaryTabProps) {
  const [dictSearchQuery, setDictSearchQuery] = useState<string>('');
  const [dictCategory, setDictCategory] = useState<CategoryType>('All');

  return (
    <motion.div
      key="tab-dictionary"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex-1 flex flex-col space-y-4"
    >
      <div className="border bg-[#FFFDF9] border-[#E6E2D3] rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div>
            <h4 className="text-sm font-serif font-bold text-[#1C1917] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#D97706]" />
              <span>Specialized Scripture Dictionaries</span>
            </h4>
            <p className="text-[11px] text-[#57534E]">
              Browse accurate philosophical and theological terms across classical scriptures.
            </p>
          </div>
          <div className="text-[10px] font-mono text-[#78716C] bg-[#F5F5F4] px-2 py-1 rounded border border-[#E6E2D3]">
            Total Terms: {Object.keys(SPECIALIZED_SCRIPTURE_DICT).length} entries
          </div>
        </div>

        {/* Filter Search controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Devanagari, English or Hindi..."
              value={dictSearchQuery}
              onChange={(e) => setDictSearchQuery(e.target.value)}
              className="w-full text-xs bg-white border border-[#E6E2D3] rounded-lg py-1.5 pl-3 pr-8 text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#D97706] focus:border-[#D97706]"
            />
            {dictSearchQuery && (
              <button
                onClick={() => setDictSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-gray-100 hover:bg-gray-200 px-1 rounded text-gray-500 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category selector */}
          <div className="flex flex-wrap gap-1 items-center">
            {(['All', 'Vedas', 'Upanishads', 'Gita', 'Ramayana', 'Puranas'] as CategoryType[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setDictCategory(cat)}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-all cursor-pointer ${
                  dictCategory === cat
                    ? 'bg-[#D97706] text-white'
                    : 'bg-[#F5F5F4] text-[#57534E] hover:bg-gray-200 border border-[#E6E2D3]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Word results list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
        {Object.entries(SPECIALIZED_SCRIPTURE_DICT)
          .filter(([word, entry]) => {
            const matchesCat = dictCategory === 'All' || entry.category === dictCategory;
            const normSearch = dictSearchQuery.toLowerCase();
            const matchesSearch =
              word.toLowerCase().includes(normSearch) ||
              entry.eng.toLowerCase().includes(normSearch) ||
              entry.hin.toLowerCase().includes(normSearch) ||
              entry.grammar.toLowerCase().includes(normSearch);
            return matchesCat && matchesSearch;
          })
          .map(([word, entry]) => {
            const categoryColors: Record<string, string> = {
              Vedas: 'bg-amber-100 text-amber-900 border-amber-200',
              Upanishads: 'bg-violet-100 text-violet-900 border-violet-200',
              Gita: 'bg-emerald-100 text-emerald-950 border-emerald-200',
              Ramayana: 'bg-blue-100 text-blue-900 border-blue-200',
              Puranas: 'bg-rose-100 text-rose-900 border-rose-200'
            };
            return (
              <div
                key={word}
                className="border border-[#E6E2D3] hover:border-[#D97706]/40 hover:bg-[#FAF9F5]/40 rounded-xl p-3 flex flex-col justify-between transition-all space-y-2 bg-white"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg font-bold text-[#1C1917] tracking-wider">
                      {word}
                    </span>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${categoryColors[entry.category] || 'bg-gray-100'}`}>
                      {entry.category}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-[#78716C] leading-none">
                    {entry.grammar}
                  </div>
                </div>
                
                <div className="text-xs text-[#2D241E] space-y-1 pt-1 border-t border-dashed border-[#E6E2D3]">
                  <p className="leading-normal"><strong className="text-gray-400 text-[10px] uppercase font-mono tracking-wider block leading-none mb-0.5">English</strong> {entry.eng}</p>
                  <p className="leading-normal font-serif text-[#1C1917]"><strong className="text-gray-400 text-[10px] uppercase font-mono tracking-wider block leading-none mb-0.5">Hindi / हिन्दी</strong> {entry.hin}</p>
                </div>

                <div className="pt-1.5 flex justify-end">
                  <button
                    onClick={() => onTranslateWord(word, entry.category)}
                    className="text-[10px] font-medium text-[#D97706] hover:bg-[#D97706]/10 px-2 py-1 rounded transition-colors border border-[#D97706]/20 bg-[#D97706]/5 cursor-pointer flex items-center gap-1"
                  >
                    <span>Translate Word</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

        {Object.entries(SPECIALIZED_SCRIPTURE_DICT).filter(([word, entry]) => {
          const matchesCat = dictCategory === 'All' || entry.category === dictCategory;
          const normSearch = dictSearchQuery.toLowerCase();
          const matchesSearch =
            word.toLowerCase().includes(normSearch) ||
            entry.eng.toLowerCase().includes(normSearch) ||
            entry.hin.toLowerCase().includes(normSearch) ||
            entry.grammar.toLowerCase().includes(normSearch);
          return matchesCat && matchesSearch;
        }).length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-10 text-xs text-gray-400 font-mono">
            No matching scriptural terms found for "{dictSearchQuery}". Try another keyword!
          </div>
        )}
      </div>
    </motion.div>
  );
}

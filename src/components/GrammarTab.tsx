import React from 'react';
import { motion } from 'motion/react';
import { ScriptureAnalyzeResponse } from '../types.ts';

interface GrammarTabProps {
  analysisResult: ScriptureAnalyzeResponse | null;
}

export default function GrammarTab({ analysisResult }: GrammarTabProps) {
  return (
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
  );
}

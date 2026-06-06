import dictEntriesRaw from "../src/data/specialized_dictionary.json";

export interface DictionaryEntry {
  category: 'Vedas' | 'Upanishads' | 'Gita' | 'Ramayana' | 'Puranas';
  grammar: string;
  eng: string;
  hin: string;
}

// Single source of truth loaded dynamically from clean JSON dataset
export const SPECIALIZED_SCRIPTURE_DICT: Record<string, DictionaryEntry> = dictEntriesRaw as Record<string, DictionaryEntry>;

// Dynamically partition the dictionary categories on boot to leverage modular segments
export const VEDAS_DICT: Record<string, DictionaryEntry> = Object.fromEntries(
  Object.entries(SPECIALIZED_SCRIPTURE_DICT).filter(([_, entry]) => entry.category === 'Vedas')
);

export const UPANISHADS_DICT: Record<string, DictionaryEntry> = Object.fromEntries(
  Object.entries(SPECIALIZED_SCRIPTURE_DICT).filter(([_, entry]) => entry.category === 'Upanishads')
);

export const GITA_DICT: Record<string, DictionaryEntry> = Object.fromEntries(
  Object.entries(SPECIALIZED_SCRIPTURE_DICT).filter(([_, entry]) => entry.category === 'Gita')
);

export const RAMAYANA_DICT: Record<string, DictionaryEntry> = Object.fromEntries(
  Object.entries(SPECIALIZED_SCRIPTURE_DICT).filter(([_, entry]) => entry.category === 'Ramayana')
);

export const PURANAS_DICT: Record<string, DictionaryEntry> = Object.fromEntries(
  Object.entries(SPECIALIZED_SCRIPTURE_DICT).filter(([_, entry]) => entry.category === 'Puranas')
);

// Helper to calculate runtime stats for UI counters
export function getDictionaryStats() {
  return {
    Vedas: Object.keys(VEDAS_DICT).length,
    Upanishads: Object.keys(UPANISHADS_DICT).length,
    Gita: Object.keys(GITA_DICT).length,
    Ramayana: Object.keys(RAMAYANA_DICT).length,
    Puranas: Object.keys(PURANAS_DICT).length,
    Total: Object.keys(SPECIALIZED_SCRIPTURE_DICT).length
  };
}

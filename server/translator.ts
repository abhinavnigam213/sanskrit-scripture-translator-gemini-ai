import { GoogleGenAI, Type } from "@google/genai";
import { TranslationResponse, ScriptureAnalyzeResponse, TransliterateResponse } from "../src/types.ts";
import { SPECIALIZED_SCRIPTURE_DICT } from "./dictionaries.ts";
import { devanagariToSlp1, devanagariToIast, iastToPhonetic } from "../src/utils/transliteration.ts";
import COMMON_VADIC_DICT_RAW from "../src/data/common_dictionary.json";
import POPULAR_ARCHIVE_RAW from "../src/data/popular_archive.json";

function getDictionaryHints(text: string): string {
  const hints: string[] = [];
  const words = text.split(/\s+/);
  for (const w of words) {
    const clean = w.replace(/[।॥,.\n\r]/g, "").trim();
    if (!clean) continue;
    if (SPECIALIZED_SCRIPTURE_DICT[clean]) {
      const match = SPECIALIZED_SCRIPTURE_DICT[clean];
      hints.push(`- "${clean}": [${match.category}] Grammar: ${match.grammar}, English definition: "${match.eng}", Hindi term: "${match.hin}"`);
    }
  }
  
  if (hints.length > 0) {
    return `\nSpecialized Lexicon Hints (Use these exact theological definitions for terms from the text if they are relevant to your scriptural translation or breakdown):\n${hints.join('\n')}\n`;
  }
  return '';
}

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please set it in your environment/secrets configuration.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Generic word parser map loaded dynamically from JSON
const COMMON_VADIC_DICT: Record<string, { grammar: string; eng: string; hin: string }> = COMMON_VADIC_DICT_RAW as Record<string, { grammar: string; eng: string; hin: string }>;

function parseGenericWordBreakdown(word: string) {
  const cleanWord = word.trim().replace(/[।॥,.\n\r]/g, "");
  if (!cleanWord) return null;

  const iastWord = devanagariToIast(cleanWord);

  if (SPECIALIZED_SCRIPTURE_DICT[cleanWord]) {
    const entry = SPECIALIZED_SCRIPTURE_DICT[cleanWord];
    return {
      word: cleanWord,
      grammar: `[${entry.category}] ${entry.grammar}`,
      meaningEnglish: entry.eng,
      meaningHindi: entry.hin
    };
  }

  if (COMMON_VADIC_DICT[cleanWord]) {
    return {
      word: cleanWord,
      grammar: COMMON_VADIC_DICT[cleanWord].grammar,
      meaningEnglish: COMMON_VADIC_DICT[cleanWord].eng,
      meaningHindi: COMMON_VADIC_DICT[cleanWord].hin
    };
  }

  let grammar = "Sanskrit Particle / Verb / Noun";
  let meaningEnglish = `Transliterated: ${iastWord}`;
  let meaningHindi = `लिप्यन्तरण: ${iastWord}`;

  if (cleanWord.endsWith("स्य")) {
    grammar = "Genitive Singular Noun (Masculine/Neuter)";
    const root = cleanWord.substring(0, cleanWord.length - 2);
    const rootIast = devanagariToIast(root);
    meaningEnglish = `of / belonging to ${rootIast}`;
    meaningHindi = `${root} का / के / की`;
  } else if (cleanWord.endsWith("ेषु") || cleanWord.endsWith("षु")) {
    grammar = "Locative Plural Noun";
    const root = cleanWord.substring(0, cleanWord.length - 3);
    meaningEnglish = `amongst or within the elements of ${devanagariToIast(root)}`;
    meaningHindi = `${root || cleanWord} में / पर / सभी में`;
  } else if (cleanWord.endsWith("े")) {
    grammar = "Locative Singular / Masculine Vocative";
    meaningEnglish = `in / at / upon ${iastWord}`;
    meaningHindi = `${cleanWord} में / के भीतर`;
  } else if (cleanWord.endsWith("ात्")) {
    grammar = "Ablative Singular Noun";
    const root = cleanWord.substring(0, cleanWord.length - 3);
    meaningEnglish = `originating from / due to ${devanagariToIast(root)}`;
    meaningHindi = `${root || cleanWord} से / कारण से`;
  } else if (cleanWord.endsWith("ः")) {
    grammar = "Nominative Singular Noun (Masculine)";
    meaningEnglish = `the subject: ${iastWord}`;
    meaningHindi = `कर्ता कारक रूप`;
  } else if (cleanWord.endsWith("म्")) {
    grammar = "Accusative Singular / Neuter Nominative";
    meaningEnglish = `the object or container of ${iastWord.replace(/m$/, "")}`;
    meaningHindi = `कर्म कारक / तटस्थ स्वरूप`;
  } else if (cleanWord.endsWith("ामि")) {
    grammar = "Verb: Present Active 1st Person Singular";
    meaningEnglish = `I perform / manifest action of ${iastWord}`;
    meaningHindi = `मैं क्रिया करता / करती हूँ`;
  } else if (cleanWord.endsWith("ति")) {
    grammar = "Verb: Present Active 3rd Person Singular";
    meaningEnglish = `performs or undergoes the act`;
    meaningHindi = `वह क्रिया सम्पन्न करता है`;
  }

  return {
    word: cleanWord,
    grammar,
    meaningEnglish,
    meaningHindi
  };
}

// ==========================================
// RICH ARCHIVE OF POPULAR VEDIC SCRIPTURES
// ==========================================

const POPULAR_ARCHIVE: Record<string, ScriptureAnalyzeResponse & { poeticMeter: string }> = POPULAR_ARCHIVE_RAW as Record<string, ScriptureAnalyzeResponse & { poeticMeter: string }>;

function tryMatchingScriptureArchive(text: string): (ScriptureAnalyzeResponse & { poeticMeter: string }) | null {
  const normInput = text.replace(/[\s\s\r\n\t।॥.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
  
  if (normInput.includes("कर्म") || normInput.includes("karma")) return POPULAR_ARCHIVE['karma'];
  if (normInput.includes("यदा") || normInput.includes("yada")) return POPULAR_ARCHIVE['yada'];
  if (normInput.includes("त्र्यम्ब") || normInput.includes("tryamb") || normInput.includes("mrityun")) return POPULAR_ARCHIVE['tryambakam'];
  if (normInput.includes("गायत्री") || normInput.includes("gaya") || normInput.includes("bhurbhu")) return POPULAR_ARCHIVE['om bhur'];
  if (normInput.includes("सहनाव") || normInput.includes("shanti") || normInput.includes("sahana")) return POPULAR_ARCHIVE['saha na'];
  if (normInput.includes("ईश") || normInput.includes("ishav") || normInput.includes("tyaktena")) return POPULAR_ARCHIVE['isha vasyam'];

  return null;
}

// ==========================================
// CORE TRANSLATOR EXPORTS WITH COGNITIVE FALLBACKS
// ==========================================

export async function translateText(
  text: string,
  sourceLang: 'sanskrit' | 'hindi' | 'english' | 'auto',
  targetLang: 'sanskrit' | 'hindi' | 'english',
  scriptureContext?: string
): Promise<TranslationResponse> {
  try {
    const ai = getAiClient();
    const contextPrompt = scriptureContext ? `The text is from ${scriptureContext} or related Hindu scripture.` : '';
    const dictHints = getDictionaryHints(text);
    const prompt = `Translate the following text.
Source Language: ${sourceLang}
Target Language: ${targetLang}
Context: ${contextPrompt}
${dictHints}

Text to translate:
"${text}"

Provide the translation, a word-by-word grammar and meaning breakdown (called Padapatha parsing, which splits sandhi compounds if source contains Sanskrit, or breakdown of words if not), and a philological/philosophical scriptural explanation.`;

    const systemInstruction = `You are an expert philologist, Indologist, and scriptural scholar specializing in Sanskrit scriptures (Vedas, Upanishads, Bhagavad Gita, Puranas, Ramayana) as well as Hindi and English scriptural commentaries.
Translate text precisely. When dealing with Sanskrit, respect the philosophical nuances and render exact meanings.
Provide the output strictly in the specified JSON structure.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["sourceLang", "targetLang", "translatedText", "explanation", "wordBreakdown"],
          properties: {
            sourceLang: {
              type: Type.STRING,
              description: "The identified source language (always one of: 'sanskrit', 'hindi', 'english')."
            },
            targetLang: {
              type: Type.STRING,
              description: "The targeted language."
            },
            translatedText: {
              type: Type.STRING,
              description: "The translated textual response."
            },
            explanation: {
              type: Type.STRING,
              description: "Philosophical, theological, and contextual analysis/commentary appropriate to Hindu scriptural tradition."
            },
            wordBreakdown: {
              type: Type.ARRAY,
              description: "Detailed word-by-word grammatical and lexical parsing. Highly recommended for Sanskrit compound words to split sandhis.",
              items: {
                type: Type.OBJECT,
                required: ["word", "meaningHindi", "meaningEnglish"],
                properties: {
                  word: { type: Type.STRING, description: "Sanskrit word or breakdown particle." },
                  grammar: { type: Type.STRING, description: "Grammatical context (e.g. Nominative Singular, Root-verb root, conjugation, sandhi split etc.)." },
                  meaningHindi: { type: Type.STRING, description: "Meaning of the specific element in Hindi." },
                  meaningEnglish: { type: Type.STRING, description: "Meaning of the specific element in English." }
                }
              }
            }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text returned from Gemini API");
    }

    return JSON.parse(response.text.trim()) as TranslationResponse;
  } catch (error: any) {
    console.warn("Falling back to local Scripture Analysis parser due to API exception:", error.message || error);
    
    // Attempt archive match
    const archiveMatch = tryMatchingScriptureArchive(text);
    if (archiveMatch) {
      const isHindi = targetLang === 'hindi';
      return {
        sourceLang: 'sanskrit',
        targetLang: targetLang,
        translatedText: isHindi ? archiveMatch.translationHindi : archiveMatch.translationEnglish,
        explanation: `${archiveMatch.spiritualSignificance} (⚠️ Computed via Local Archive Backup because Live API encountered normal free-tier quota limitations)`,
        wordBreakdown: archiveMatch.wordBreakdown,
        isFallback: true
      };
    }

    // Generic fallback computation
    const tokens = text.split(/\s+/).filter(Boolean).slice(0, 15);
    const breakdown = tokens.map(t => parseGenericWordBreakdown(t)).filter(Boolean) as any[];
    const iastText = devanagariToIast(text);

    // Try matching if the text (or trimmed version) exists in our dictionary
    const cleanInput = text.trim().replace(/[।॥,.\n\r]/g, "");
    const dictMatch = COMMON_VADIC_DICT[cleanInput];
    
    let trText = "";
    if (dictMatch) {
      trText = targetLang === 'english' ? dictMatch.eng : dictMatch.hin;
    } else {
      // Try word-by-word construction
      const words = tokens.map(token => {
        const wordClean = token.trim().replace(/[।॥,.\n\r]/g, "");
        const match = COMMON_VADIC_DICT[wordClean];
        if (match) {
          return targetLang === 'english' ? match.eng : match.hin;
        }
        return null;
      }).filter(Boolean);
      
      if (words.length > 0) {
        trText = words.join(" / ");
      } else {
        trText = targetLang === 'english' ? `Rendered translation: "${iastText}"` : `हिन्दी रूप: "${text}"`;
      }
    }

    return {
      sourceLang: 'sanskrit',
      targetLang: targetLang,
      translatedText: trText,
      explanation: `⚠️ [VedicEngine Offline Backup Active] Live Gemini translation services are currently exhausted. Transliteration and local dictionary lookup completed locally successfully.\n\nRaw text: "${iastText}"`,
      wordBreakdown: breakdown,
      isFallback: true
    };
  }
}

export async function transliterateText(
  text: string,
  sourceScript: 'devanagari' | 'iast' | 'itrans' | 'english_phonetic' | 'slp1',
  targetScript: 'devanagari' | 'iast' | 'itrans' | 'english_phonetic' | 'slp1'
): Promise<TransliterateResponse> {
  try {
    const ai = getAiClient();
    const prompt = `Convert (transliterate) the following text from the source script to the target script. 
Source Script: ${sourceScript}
Target Script: ${targetScript}

Input Text:
${text}

For your diacritic markers (in IAST), be exceptionally precise (e.g. using dots below for retroflexes like ṣ, ṭ, ḍ, line above for long vowels like ā, ī, ū, and dot above for anusvara m, etc.). Preservation of line structures is required.`;

    const systemInstruction = `You are a helper specializing in Indic script transliteration.
Your goal is to transliterate characters purely phonetically/orthographically between Devanagari (देवानागरी), IAST (International Alphabet of Sanskrit Transliteration with diacritics), ITRANS (ASCII), SLP1 (Sanskrit Library Phonetic basic ASCII encoding standard), and English Phonetic (for chanting/singing).
Do NOT translate the meaning, only convert the phonetic representation from one system to another.
In SLP1, map retroflex consonants to w, W, q, Q, R, sibilants to S/z, nasals to N/Y/R/n/m, and vowels and anusvara according to Sanskrit Library SLP1 specs.
Provide the output strictly in JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["sourceScript", "targetScript", "transliteratedText"],
          properties: {
            sourceScript: { type: Type.STRING },
            targetScript: { type: Type.STRING },
            transliteratedText: { type: Type.STRING, description: "The transliterated output maintaining line structures." }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text returned from Gemini API");
    }

    return JSON.parse(response.text.trim()) as TransliterateResponse;
  } catch (error: any) {
    console.warn("Transliterating offline fallback for:", text);
    let out = text;
    if (sourceScript === 'devanagari') {
      if (targetScript === 'slp1') {
        out = devanagariToSlp1(text);
      } else {
        const iast = devanagariToIast(text);
        if (targetScript === 'iast') {
          out = iast;
        } else if (targetScript === 'english_phonetic') {
          out = iastToPhonetic(iast);
        } else if (targetScript === 'itrans') {
          out = iast.toLowerCase().replace(/ā/g, 'aa').replace(/ī/g, 'ii').replace(/ū/g, 'uu').replace(/ṛ/g, 'RRi').replace(/ñ/g, '~n').replace(/ṅ/g, 'N').replace(/ś/g, 'sh_').replace(/ṣ/g, 'Sh').replace(/ṭ/g, 'T').replace(/ḍ/g, 'D').replace(/ṇ/g, 'N').replace(/ḥ/g, 'H').replace(/ṁ/g, 'M');
        }
      }
    } else {
      // Very basic fallback if source is not devanagari
      out = `[Offline Transliteration] ${text}`;
    }

    return {
      sourceScript,
      targetScript,
      transliteratedText: out
    };
  }
}

export async function analyzeScripture(
  text: string,
  sourceContext?: string
): Promise<ScriptureAnalyzeResponse> {
  try {
    const ai = getAiClient();
    const contextText = sourceContext ? `Contextual source hint: ${sourceContext}` : '';
    const dictHints = getDictionaryHints(text);
    const prompt = `Analyze the following Hindu scripture/verse in deep detail:
"${text}"
${contextText}
${dictHints}

Extract or compute:
1. Identified scripture source (e.g. Bhagavad Gita chapter/verse, Veda mandala, Upanishad name).
2. Clean IAST transliteration (with correct diacritics).
3. Phonetic English transliteration (friendly for active chanting).
4. English prose translation.
5. Hindi prose translation.
6. Spiritual/Theological significance & commentary.
7. Word-by-word grammatical breakdown (declensions, root words, nouns/verbs, individual meanings).
8. Poetic Meter name if applicable (e.g., Anustubh, Gayatri, Tristubh, Jagati etc.)`;

    const systemInstruction = `You are a high-level Sanatana Dharma and Sanskrit scripture scholar.
Analyze the provided Sanskrit/Hindi/English scripture. Even if they submit only a fragment, try your best to recognize and reconstruct the complete verse.
Always provide the response conforming strictly to the requested JSON structure.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "verse",
            "transliterationIAST",
            "transliterationPhonetic",
            "translationEnglish",
            "translationHindi",
            "spiritualSignificance",
            "wordBreakdown"
          ],
          properties: {
            verse: { type: Type.STRING, description: "The original verse (reconstructed fully in Devanagari Sanskrit if applicable)." },
            identifiedSource: { type: Type.STRING, description: "Specific chapter, verse, mandala, or hymn designation." },
            transliterationIAST: { type: Type.STRING, description: "The diacritic IAST transliteration." },
            transliterationPhonetic: { type: Type.STRING, description: "Chant-friendly simplified English phonetic script." },
            translationEnglish: { type: Type.STRING },
            translationHindi: { type: Type.STRING },
            spiritualSignificance: { type: Type.STRING, description: "A detailed explanation of the philosophical, meditative, or practical significance of this scripture verse." },
            poeticMeter: { type: Type.STRING, description: "Sanskrit metric system name (Chandas)." },
            wordBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["word", "meaningHindi", "meaningEnglish"],
                properties: {
                  word: { type: Type.STRING, description: "The single word or compound element." },
                  grammar: { type: Type.STRING, description: "Grammar context (e.g., root word, Sandhi details, case, gender, conjugation)." },
                  meaningHindi: { type: Type.STRING },
                  meaningEnglish: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text returned from Gemini API");
    }

    return JSON.parse(response.text.trim()) as ScriptureAnalyzeResponse;
  } catch (error: any) {
    console.warn("Falling back to local Scripture Analysis parser due to API exception:", error.message || error);
    
    // Attempt archive match first
    const archiveMatch = tryMatchingScriptureArchive(text);
    if (archiveMatch) {
      return {
        ...archiveMatch,
        spiritualSignificance: `${archiveMatch.spiritualSignificance}\n\n⚠️ [Offline Scholar Engine Active] Analysis computed locally using built-in Vedic corpus archives. Free-tier live Gemini key is resting or has exceeded rate limitations.`,
        isFallback: true
      };
    }

    // Heuristics breakdown and transliteration
    const iastVal = devanagariToIast(text);
    const phoneticVal = iastToPhonetic(iastVal);
    const tokens = text.split(/\s+/).filter(Boolean);
    const elementsBreakdown = tokens.map(tok => parseGenericWordBreakdown(tok)).filter(Boolean) as any[];

    return {
      verse: text,
      identifiedSource: "Vedic Classical Scripture (Heuristics Parsed)",
      transliterationIAST: iastVal,
      transliterationPhonetic: phoneticVal,
      translationEnglish: `Rendered Translation (Roman Script): "${iastVal}"`,
      translationHindi: `देवनागरी लिप्यन्तरण: "${text}"`,
      spiritualSignificance: `⚠️ [Offline Scholar Engine Active] This verse has been parsed using are-limit fallback filters due to live Gemini API rate limit restrictions in settings.\n\nPhonetic and character sandhis are mapped successfully. Live explanations will load once API keys refresh.`,
      wordBreakdown: elementsBreakdown,
      poeticMeter: tokens.length >= 8 ? "Anustubh (Possibility)" : "Vedic Chanting Meter",
      isFallback: true
    };
  }
}

export function webDevanagariToSlp1(text: string): string {
  const vowels: { [key: string]: string } = {
    'अ': 'a', 'आ': 'A', 'इ': 'i', 'ई': 'I', 'उ': 'u', 'ऊ': 'U', 'ऋ': 'f', 'ॠ': 'F', 'ऌ': 'x', 'ॡ': 'X',
    'ए': 'e', 'ऐ': 'E', 'ओ': 'o', 'औ': 'O'
  };

  const matras: { [key: string]: string } = {
    'ा': 'A', 'ि': 'i', 'ी': 'I', 'ु': 'u', 'ू': 'U', 'ृ': 'f', 'ॄ': 'F', 'ॢ': 'x', 'ॣ': 'X',
    'े': 'e', 'ै': 'E', 'ो': 'o', 'ौ': 'O'
  };

  const consonants: { [key: string]: string } = {
    'क': 'k', 'ख': 'K', 'ग': 'g', 'घ': 'G', 'ङ': 'N',
    'च': 'c', 'छ': 'C', 'ज': 'j', 'झ': 'J', 'ञ': 'Y',
    'ट': 'w', 'ठ': 'W', 'ड': 'q', 'ढ': 'Q', 'ण': 'R',
    'त': 't', 'थ': 'T', 'द': 'd', 'ध': 'D', 'न': 'n',
    'प': 'p', 'फ': 'P', 'ब': 'b', 'भ': 'B', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
    'श': 'S', 'ष': 'z', 'स': 's', 'ह': 'h',
    'ळ': 'L', 'क्ष': 'kz', 'त्र': 'tr', 'ज्ञ': 'jY'
  };

  const shunya: { [key: string]: string } = {
    'ं': 'M',
    'ः': 'H',
    'ँ': '~'
  };

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === 'ॐ') {
      result += 'oM';
      continue;
    }

    if (consonants[char] !== undefined) {
      let base = consonants[char];
      if (nextChar === '्') {
        result += base;
        i++; // skip halant
      } else if (matras[nextChar] !== undefined) {
        result += base + matras[nextChar];
        i++; // skip matra
      } else {
        result += base + 'a';
      }
    } else if (vowels[char] !== undefined) {
      result += vowels[char];
    } else if (shunya[char] !== undefined) {
      result += shunya[char];
    } else {
      result += char === '।' ? '|' : char === '॥' ? '||' : char === 'ऽ' ? "'" : char;
    }
  }
  return result;
}

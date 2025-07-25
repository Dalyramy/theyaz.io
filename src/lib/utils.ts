import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Latin to Tifinagh mapping (main letters)
export const LATIN_TO_TIFINAGH: Record<string, string> = {
  'a': 'ⴰ', 'b': 'ⴱ', 'g': 'ⴳ', 'd': 'ⴷ', 'ḍ': 'ⴹ', 'e': 'ⴻ', 'f': 'ⴼ', 'k': 'ⴽ', 'h': 'ⵀ', 'ḥ': 'ⵃ',
  'ɛ': 'ⵄ', 'x': 'ⵅ', 'q': 'ⵇ', 'i': 'ⵉ', 'j': 'ⵊ', 'l': 'ⵍ', 'm': 'ⵎ', 'n': 'ⵏ', 'u': 'ⵓ', 'r': 'ⵔ',
  'ṛ': 'ⵕ', 'ɣ': 'ⵖ', 's': 'ⵙ', 'ṣ': 'ⵚ', 'c': 'ⵛ', 't': 'ⵜ', 'ṭ': 'ⵟ', 'w': 'ⵡ', 'y': 'ⵢ', 'z': 'ⵣ', 'ẓ': 'ⵥ',
};

export function latinToTifinagh(text: string): string {
  return text.split('').map(char => LATIN_TO_TIFINAGH[char] || char).join('');
}

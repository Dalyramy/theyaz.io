import React from 'react';

interface AmazighKeyboardProps {
  onInsert: (char: string) => void;
  largeButtons?: boolean;
}

// Tifinagh and Latin Amazigh characters (main set)
const CHARACTERS = [
  // Tifinagh
  'ⴰ', 'ⴱ', 'ⴳ', 'ⴷ', 'ⴹ', 'ⴻ', 'ⴼ', 'ⴽ', 'ⵀ', 'ⵃ', 'ⵄ', 'ⵅ', 'ⵇ', 'ⵉ', 'ⵊ', 'ⵍ', 'ⵎ', 'ⵏ', 'ⵓ', 'ⵔ', 'ⵕ', 'ⵖ', 'ⵙ', 'ⵚ', 'ⵛ', 'ⵜ', 'ⵟ', 'ⵡ', 'ⵢ', 'ⵣ', 'ⵥ',
  // Latin (Amazigh)
  'a', 'b', 'g', 'd', 'ḍ', 'e', 'f', 'k', 'h', 'ḥ', 'ɛ', 'x', 'q', 'i', 'j', 'l', 'm', 'n', 'u', 'r', 'ṛ', 'ɣ', 's', 'ṣ', 'c', 't', 'ṭ', 'w', 'y', 'z', 'ẓ'
];

const AmazighKeyboard: React.FC<AmazighKeyboardProps> = ({ onInsert, largeButtons }) => {
  return (
    <div className="flex flex-wrap gap-2 bg-muted p-4 rounded shadow justify-center">
      {CHARACTERS.map((char) => (
        <button
          key={char}
          className={`m-1 rounded border shadow-sm font-semibold transition
            ${largeButtons ? 'text-2xl px-4 py-3 min-w-[48px] min-h-[48px]' : 'text-lg px-3 py-2'}
            bg-card hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
          onClick={() => onInsert(char)}
          type="button"
          aria-label={`Insérer la lettre ${char}`}
        >
          {char}
        </button>
      ))}
    </div>
  );
};

export default AmazighKeyboard; 
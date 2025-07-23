import React, { useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import AmazighKeyboard from '../components/ui/AmazighKeyboard';

// Latin to Tifinagh mapping (main letters)
const LATIN_TO_TIFINAGH: Record<string, string> = {
  'a': 'ⴰ', 'b': 'ⴱ', 'g': 'ⴳ', 'd': 'ⴷ', 'ḍ': 'ⴹ', 'e': 'ⴻ', 'f': 'ⴼ', 'k': 'ⴽ', 'h': 'ⵀ', 'ḥ': 'ⵃ',
  'ɛ': 'ⵄ', 'x': 'ⵅ', 'q': 'ⵇ', 'i': 'ⵉ', 'j': 'ⵊ', 'l': 'ⵍ', 'm': 'ⵎ', 'n': 'ⵏ', 'u': 'ⵓ', 'r': 'ⵔ',
  'ṛ': 'ⵕ', 'ɣ': 'ⵖ', 's': 'ⵙ', 'ṣ': 'ⵚ', 'c': 'ⵛ', 't': 'ⵜ', 'ṭ': 'ⵟ', 'w': 'ⵡ', 'y': 'ⵢ', 'z': 'ⵣ', 'ẓ': 'ⵥ',
};

function latinToTifinagh(text: string): string {
  // Replace each Latin letter with Tifinagh if mapping exists
  return text.split('').map(char => LATIN_TO_TIFINAGH[char] || char).join('');
}

const Trans: React.FC = () => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Insert character at cursor position
  const handleInsert = (char: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setText((prev) => prev + char);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.slice(0, start) + char + text.slice(end);
    setText(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + char.length;
    }, 0);
  };

  // Copy text to clipboard
  const handleCopy = async () => {
    if (text) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Clear textarea
  const handleClear = () => {
    setText('');
    textareaRef.current?.focus();
  };

  // Auto-convert Latin to Tifinagh as user types
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setText(latinToTifinagh(input));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-2xl mx-auto py-8 px-2 sm:px-4">
        <h1 className="text-3xl font-bold mb-2">Clavier Amazigh (Trans)</h1>
        <p className="mb-3 text-lg text-muted-foreground">
          <span role="img" aria-label="info">🧒</span> Tape sur les lettres pour écrire en amazigh ! Tu peux copier ou effacer le texte facilement.<br/>
          <span className="text-sm">Astuce : Si tu tapes avec ton clavier, les lettres latines se transforment automatiquement en lettres amazigh (ⴰⴱⴳ...)</span>
        </p>
        <textarea
          ref={textareaRef}
          className="w-full h-32 p-3 border-2 border-primary rounded-lg mb-3 bg-card text-foreground text-xl focus:outline-none focus:ring-2 focus:ring-primary transition"
          value={text}
          onChange={handleChange}
          placeholder="Écris ici..."
        />
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-lg shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={!text}
            aria-label="Copier le texte"
          >
            Copier
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-bold text-lg shadow hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive"
            disabled={!text}
            aria-label="Effacer le texte"
          >
            Effacer
          </button>
          {copied && (
            <span className="ml-2 text-green-600 font-semibold animate-pulse">Copié !</span>
          )}
        </div>
        <AmazighKeyboard onInsert={handleInsert} largeButtons />
      </main>
    </div>
  );
};

export default Trans; 
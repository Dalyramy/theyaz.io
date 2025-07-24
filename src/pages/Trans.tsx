import React, { useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import AmazighKeyboard from '../components/ui/AmazighKeyboard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useTranslation } from 'react-i18next';
import { cn, latinToTifinagh } from '../lib/utils';
import { Copy, RefreshCcw, Zap } from 'lucide-react';
import LanguageSelector from '../components/ui/LanguageSelector';

const Trans: React.FC = () => {
  const { t } = useTranslation();
  const [latinText, setLatinText] = useState('');
  const [tifinaghText, setTifinaghText] = useState('');
  const [copied, setCopied] = useState<'latin' | 'tifinagh' | false>(false);
  const [autoConvert, setAutoConvert] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Insert character at cursor position
  const handleInsert = (char: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setLatinText((prev) => prev + char);
      if (autoConvert) setTifinaghText(latinToTifinagh(latinText + char));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = latinText.slice(0, start) + char + latinText.slice(end);
    setLatinText(newText);
    if (autoConvert) setTifinaghText(latinToTifinagh(newText));
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + char.length;
    }, 0);
  };

  // Copy text to clipboard
  const handleCopy = async (type: 'latin' | 'tifinagh') => {
    const text = type === 'latin' ? latinText : tifinaghText;
    if (text) {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Clear textarea
  const handleClear = () => {
    setLatinText('');
    setTifinaghText('');
    textareaRef.current?.focus();
  };

  // Handle textarea change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setLatinText(input);
    if (autoConvert) setTifinaghText(latinToTifinagh(input));
  };

  // Toggle auto/manual mode
  const handleToggleMode = () => {
    setAutoConvert((prev) => {
      const next = !prev;
      if (next) setTifinaghText(latinToTifinagh(latinText));
      return next;
    });
  };

  // Manual conversion
  const handleManualConvert = () => {
    setTifinaghText(latinToTifinagh(latinText));
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
      <Navbar />
      {/* Local language selector for convenience */}
      <div className="flex justify-end w-full max-w-2xl mx-auto pt-4 px-2 sm:px-0">
        <LanguageSelector />
      </div>
      <main className="container mx-auto py-6 px-1 sm:px-4 flex flex-col items-center">
        <Card className="w-full max-w-2xl mt-4 sm:mt-6">
          <CardHeader>
            <Badge variant="secondary" className="mb-2">Amazigh ⴰⵎⴰⵣⵉⵖ</Badge>
            <CardTitle className="text-2xl sm:text-3xl font-bold mb-1">
              {t('trans.title', 'Amazigh Keyboard & Converter')}
            </CardTitle>
            <CardDescription>
              {t('trans.desc', 'Type in Latin or Tifinagh. Auto-convert to Amazigh letters. Copy, reset, or use the on-screen keyboard!')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              <Button
                variant={autoConvert ? 'default' : 'outline'}
                size="sm"
                onClick={handleToggleMode}
                aria-pressed={autoConvert}
                className="flex-1 sm:flex-initial min-h-[44px]"
              >
                <Zap className="w-4 h-4" />
                {autoConvert ? t('trans.auto', 'Auto-convert ON') : t('trans.auto_off', 'Manual mode')}
              </Button>
              {!autoConvert && (
                <Button variant="secondary" size="sm" onClick={handleManualConvert} className="flex-1 sm:flex-initial min-h-[44px]">
                  {t('trans.convert', 'Convert')}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleClear} aria-label={t('trans.clear', 'Reset')} className="flex-1 sm:flex-initial min-h-[44px]">
                <RefreshCcw className="w-4 h-4" />
                {t('trans.clear', 'Reset')}
              </Button>
            </div>
            <textarea
              ref={textareaRef}
              className="w-full h-32 p-3 border-2 border-primary rounded-lg mb-3 bg-card text-foreground text-xl focus:outline-none focus:ring-2 focus:ring-primary transition resize-none sm:h-32 min-h-[96px]"
              value={latinText}
              onChange={handleChange}
              placeholder={t('trans.placeholder', 'Type here...')}
              aria-label={t('trans.input_label', 'Latin or Tifinagh input')}
              inputMode="text"
              autoCorrect="off"
              spellCheck={false}
            />
            <div className="flex flex-col sm:flex-row gap-2 mb-4 w-full">
              <Button
                onClick={() => handleCopy('tifinagh')}
                variant="default"
                size="sm"
                disabled={!tifinaghText}
                aria-label={t('trans.copy_tifinagh', 'Copy Tifinagh')}
                className="flex-1 min-h-[44px]"
              >
                <Copy className="w-4 h-4" />
                {t('trans.copy_tifinagh', 'Copy Tifinagh')}
              </Button>
              <Button
                onClick={() => handleCopy('latin')}
                variant="outline"
                size="sm"
                disabled={!latinText}
                aria-label={t('trans.copy_latin', 'Copy Latin')}
                className="flex-1 min-h-[44px]"
              >
                <Copy className="w-4 h-4" />
                {t('trans.copy_latin', 'Copy Latin')}
              </Button>
              {copied && (
                <span className="ml-2 text-green-600 font-semibold animate-pulse text-center sm:text-left">
                  {copied === 'latin' ? t('trans.copied_latin', 'Latin copied!') : t('trans.copied_tifinagh', 'Tifinagh copied!')}
                </span>
              )}
            </div>
            <div className="mb-2">
              <div className="font-semibold mb-1 text-muted-foreground text-sm">
                {t('trans.preview', 'Tifinagh Preview:')}
              </div>
              <div className={cn(
                'min-h-[2.5rem] rounded bg-muted px-3 py-2 text-2xl font-amazigh border border-border break-words',
                tifinaghText ? 'text-foreground' : 'text-muted-foreground opacity-60'
              )}>
                {tifinaghText || t('trans.preview_placeholder', 'ⴰⴱⴳ...')}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-2">
            <div className="w-full overflow-x-auto pb-2">
              <AmazighKeyboard onInsert={handleInsert} largeButtons />
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Trans; 
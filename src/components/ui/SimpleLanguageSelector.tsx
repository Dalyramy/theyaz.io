'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import AmazighFlag from './AmazighFlag';
import { useLanguage } from '@/contexts/LanguageContext';

const languages = [
  { code: 'ber', name: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', flag: 'custom' },
  { code: 'en', name: 'English', flag: '🇨🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇵🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
];

export function SimpleLanguageSelector() {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode as 'en' | 'fr' | 'ar' | 'ber' | 'es' | 'zh' | 'uk');
    setIsOpen(false);
  };

  // Get current language display info
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-primary/10"
          >
            <Globe className="h-4 w-4" />
            <span className="sr-only">Language</span>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 max-h-[350px] overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-3 cursor-pointer ${
              currentLanguage === language.code
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-primary/5'
            }`}
          >
            {language.flag === 'custom' ? (
              <AmazighFlag size={20} />
            ) : (
              <span className="text-lg">{language.flag}</span>
            )}
            <span className="flex-1">{language.name}</span>
            {currentLanguage === language.code && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 bg-primary rounded-full"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
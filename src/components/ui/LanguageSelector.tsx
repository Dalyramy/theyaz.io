import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import AmazighFlag from './AmazighFlag';

const languages = [
  { code: 'ber', name: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', flag: 'custom' },
  { code: 'en', name: 'English', flag: '🇨🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇹🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const LanguageSelector = () => {
  const { t } = useTranslation();
  const { currentLanguage: currentLang, changeLanguage, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

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
            <span className="sr-only">{t('language.language')}</span>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-3 cursor-pointer ${
              currentLang === language.code
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
            {currentLang === language.code && (
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
};

export default LanguageSelector; 
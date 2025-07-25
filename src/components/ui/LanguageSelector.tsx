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

const topLanguages = [
  { code: 'ber', name: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', flag: 'custom' },
  { code: 'en', name: 'English', flag: '🇨🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇵🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
];

// ISO 639-1 languages with native names and flags (no Israeli flag for Hebrew)
const isoLanguages = [
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
  { code: 'ar', name: 'العربية', flag: '🇹🇳' },
  { code: 'az', name: 'Azərbaycanca', flag: '🇦🇿' },
  { code: 'be', name: 'Беларуская', flag: '🇧🇾' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'bs', name: 'Bosanski', flag: '🇧🇦' },
  { code: 'ca', name: 'Català', flag: '🇪🇸' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'cy', name: 'Cymraeg', flag: '🏴' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'eo', name: 'Esperanto', flag: '🌍' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'eu', name: 'Euskara', flag: '🇪🇸' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'fo', name: 'Føroyskt', flag: '🇫🇴' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'fy', name: 'Frysk', flag: '🇳🇱' },
  { code: 'ga', name: 'Gaeilge', flag: '🇮🇪' },
  { code: 'gd', name: 'Gàidhlig', flag: '🏴' },
  { code: 'gl', name: 'Galego', flag: '🇪🇸' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'he', name: 'עברית', flag: '' }, // No Israeli flag
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'hy', name: 'Հայերեն', flag: '🇦🇲' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'is', name: 'Íslenska', flag: '🇮🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'jv', name: 'Basa Jawa', flag: '🇮🇩' },
  { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
  { code: 'kk', name: 'Қазақша', flag: '🇰🇿' },
  { code: 'km', name: 'ភាសាខ្មែរ', flag: '🇰🇭' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ku', name: 'Kurdî', flag: '🇮🇶' },
  { code: 'ky', name: 'Кыргызча', flag: '🇰🇬' },
  { code: 'lb', name: 'Lëtzebuergesch', flag: '🇱🇺' },
  { code: 'lo', name: 'ລາວ', flag: '🇱🇦' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'mg', name: 'Malagasy', flag: '🇲🇬' },
  { code: 'mi', name: 'Māori', flag: '🇳🇿' },
  { code: 'mk', name: 'Македонски', flag: '🇲🇰' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mn', name: 'Монгол', flag: '🇲🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'mt', name: 'Malti', flag: '🇲🇹' },
  { code: 'nb', name: 'Norsk Bokmål', flag: '🇳🇴' },
  { code: 'ne', name: 'नेपाली', flag: '🇳🇵' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'nn', name: 'Norsk Nynorsk', flag: '🇳🇴' },
  { code: 'oc', name: 'Occitan', flag: '🇫🇷' },
  { code: 'or', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'ps', name: 'پښتو', flag: '🇦🇫' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'qu', name: 'Runa Simi', flag: '🇵🇪' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'se', name: 'Davvisámegiella', flag: '🇸🇪' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenščina', flag: '🇸🇮' },
  { code: 'so', name: 'Soomaaliga', flag: '🇸🇴' },
  { code: 'sq', name: 'Shqip', flag: '🇦🇱' },
  { code: 'sr', name: 'Српски', flag: '🇷🇸' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'uz', name: 'Oʻzbekcha', flag: '🇺🇿' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'wa', name: 'Walon', flag: '🇧🇪' },
  { code: 'xh', name: 'isiXhosa', flag: '🇿🇦' },
  { code: 'yi', name: 'ייִדיש', flag: '' }, // No Israeli flag
  { code: 'yo', name: 'Yorùbá', flag: '🇳🇬' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

// Remove duplicates and keep topLanguages at the top
const languages = [
  ...topLanguages,
  ...isoLanguages.filter(
    (lang) => !topLanguages.some((top) => top.code === lang.code)
  ),
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
        className="w-48 max-h-[350px] overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
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
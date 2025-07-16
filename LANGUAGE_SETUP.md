# Language Support Setup

This gallery app now supports multiple languages with a complete internationalization (i18n) system.

## Supported Languages

- 🇨🇦 English (en)
- 🇫🇷 French (fr)
- 🇪🇸 Spanish (es)
- 🇹🇳 Arabic (ar) - with RTL support
- 🇩🇿 Amazigh (ber) - with Tifinagh script

## How to Use

### Language Selector
The language selector is available in the navigation bar. Click the globe icon to switch between languages.

### RTL Support
Arabic language automatically enables right-to-left (RTL) text direction and layout adjustments.

## Adding New Translations

### 1. Add Translation Keys
Add new keys to all language files in `src/i18n/locales/`:

```json
{
  "newSection": {
    "title": "Title in English",
    "description": "Description in English"
  }
}
```

### 2. Translate to Other Languages
Add the same keys with translated values to other language files:

**French (`fr.json`):**
```json
{
  "newSection": {
    "title": "Titre en français",
    "description": "Description en français"
  }
}
```

**Spanish (`es.json`):**
```json
{
  "newSection": {
    "title": "Título en español",
    "description": "Descripción en español"
  }
}
```

**Arabic (`ar.json`):**
```json
{
  "newSection": {
    "title": "العنوان بالعربية",
    "description": "الوصف بالعربية"
  }
}
```

**Amazigh (`ber.json`):**
```json
{
  "newSection": {
    "title": "ⴰⵙⵙⵉ ⵙ ⵜⴰⵎⴰⵣⵉⵖⵜ",
    "description": "ⴰⵙⵙⵉ ⵙ ⵜⴰⵎⴰⵣⵉⵖⵜ"
  }
}
```

### 3. Use in Components

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('newSection.title')}</h1>
      <p>{t('newSection.description')}</p>
    </div>
  );
};
```

## File Structure

```
src/i18n/
├── index.ts              # i18n configuration
├── locales/
│   ├── en.json          # English translations
│   ├── fr.json          # French translations
│   ├── es.json          # Spanish translations
│   ├── ar.json          # Arabic translations
│   └── ber.json         # Amazigh translations
```

## Adding New Languages

1. Create a new translation file in `src/i18n/locales/`
2. Add the language to the `resources` object in `src/i18n/index.ts`
3. Add the language to the `languages` array in `src/components/ui/LanguageSelector.tsx`

## RTL Support

For RTL languages like Arabic:
- The `useLanguage` hook automatically sets `dir="rtl"` on the document
- CSS classes handle RTL layout adjustments
- Text alignment and margins are automatically reversed

## Persistence

Language selection is automatically saved to localStorage and restored on page reload.

## Development

The language system uses:
- `react-i18next` for React integration
- `i18next` as the core translation engine
- `i18next-browser-languagedetector` for automatic language detection
- Custom `useLanguage` hook for RTL support 
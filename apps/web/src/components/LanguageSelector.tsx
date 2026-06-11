import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <Globe className="w-4 h-4 text-slate-500" />
          <span className="hidden sm:inline">
            {languages.find(l => l.code === i18n.language)?.name || 'Language'}
          </span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="min-w-[150px] bg-white rounded-xl shadow-lg border border-slate-100 p-1.5 animate-in fade-in zoom-in duration-200 z-50"
          align="end"
          sideOffset={8}
        >
          {languages.map((lang) => (
            <DropdownMenu.Item
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg cursor-pointer outline-none select-none hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors"
            >
              {lang.name}
              {i18n.language === lang.code && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

import { useState } from 'react';
import { useLanguage, type LanguageCode } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { toast } from 'sonner';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'outline' | 'ghost' | 'default';
  size?: 'sm' | 'default' | 'lg';
}

export function LanguageSwitcher({
  className = '',
  variant = 'outline',
  size = 'sm',
}: LanguageSwitcherProps) {
  const { currentLanguage, setLanguage, currentOption, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectLanguage = (code: LanguageCode, nativeLabel: string) => {
    setLanguage(code);
    setIsOpen(false);
    toast.success(`Language changed to ${nativeLabel}! 🌐`);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`h-11 px-3.5 rounded-xl border border-border/80 bg-background/80 hover:bg-muted font-semibold text-xs shadow-sm flex items-center gap-2 ${className}`}
        >
          <Globe className='w-4 h-4 text-primary' />
          <span className='text-sm'>{currentOption.flag}</span>
          <span className='font-bold text-foreground'>{currentOption.nativeLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='w-56 p-1.5 rounded-2xl border border-border shadow-xl bg-card z-50'
      >
        <DropdownMenuLabel className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1.5'>
          Select Language / மொழி / भाषा
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableLanguages.map((lang) => {
          const isSelected = lang.code === currentLanguage;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code, lang.nativeLabel)}
              className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              <div className='flex items-center gap-2.5'>
                <span className='text-base'>{lang.flag}</span>
                <div className='flex flex-col text-left'>
                  <span className='leading-tight'>{lang.nativeLabel}</span>
                  <span className='text-[10px] text-muted-foreground font-normal'>
                    {lang.label}
                  </span>
                </div>
              </div>
              {isSelected && <Check className='w-4 h-4 text-primary' />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

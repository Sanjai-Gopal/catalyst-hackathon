import { useState } from 'react'
import { Globe, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage, type LanguageCode } from '@/context/language-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface LanguageSwitcherProps {
  className?: string
  variant?: 'outline' | 'ghost' | 'default'
  size?: 'sm' | 'default' | 'lg'
}

export function LanguageSwitcher({
  className = '',
  variant = 'outline',
  size = 'sm',
}: LanguageSwitcherProps) {
  const { currentLanguage, setLanguage, currentOption, availableLanguages } =
    useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const handleSelectLanguage = (code: LanguageCode, nativeLabel: string) => {
    setLanguage(code)
    setIsOpen(false)
    toast.success(`Language changed to ${nativeLabel}! 🌐`)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          aria-label='Select application language'
          className={`flex h-11 items-center gap-2 rounded-xl border border-border/80 bg-background/80 px-3.5 text-xs font-semibold shadow-sm hover:bg-muted ${className}`}
        >
          <Globe className='h-4 w-4 text-primary' />
          <span className='text-sm'>{currentOption.flag}</span>
          <span className='font-bold text-foreground'>
            {currentOption.nativeLabel}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='z-50 w-56 rounded-2xl border border-border bg-card p-1.5 shadow-xl'
      >
        <DropdownMenuLabel className='px-2 py-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
          Select Language / மொழி / भाषा
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableLanguages.map((lang) => {
          const isSelected = lang.code === currentLanguage
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code, lang.nativeLabel)}
              className={`flex cursor-pointer items-center justify-between rounded-xl p-2.5 text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-primary/10 font-bold text-primary'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <div className='flex items-center gap-2.5'>
                <span className='text-base'>{lang.flag}</span>
                <div className='flex flex-col text-left'>
                  <span className='leading-tight'>{lang.nativeLabel}</span>
                  <span className='text-[10px] font-normal text-muted-foreground'>
                    {lang.label}
                  </span>
                </div>
              </div>
              {isSelected && <Check className='h-4 w-4 text-primary' />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

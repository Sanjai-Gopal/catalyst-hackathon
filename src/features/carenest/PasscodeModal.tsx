import { useState, type FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetRole?: 'caretaker' | 'family';
}

const VALID_PASSCODES = ['CARE-8492', '8492', 'CARE-2026', '2026'];

export function PasscodeModal({
  isOpen,
  onClose,
  onSuccess,
}: PasscodeModalProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleVerify = (e: FormEvent) => {
    e.preventDefault();
    const cleanCode = passcode.trim().toUpperCase();

    if (VALID_PASSCODES.includes(cleanCode)) {
      setError('');
      setPasscode('');
      onSuccess();
    } else {
      setError('Invalid passcode. Please use the family code (e.g. CARE-8492 or 8492).');
    }
  };

  const handleQuickFill = (code: string) => {
    setPasscode(code);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-md bg-card border-border'>
        <DialogHeader>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2'>
            <Lock className='h-6 w-6' />
          </div>
          <DialogTitle className='text-center text-xl font-bold'>
            Passcode-Protected Access
          </DialogTitle>
          <DialogDescription className='text-center text-sm text-muted-foreground'>
            Enter the authorized family or caretaker access code to view full medical controls, edit schedules, and manage appointments.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleVerify} className='space-y-4 py-2'>
          <div className='space-y-2'>
            <div className='relative'>
              <KeyRound className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                type='password'
                placeholder='Enter passcode (e.g. CARE-8492)'
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError('');
                }}
                className='pl-10 text-center tracking-widest text-lg font-mono'
                autoFocus
              />
            </div>
            {error && (
              <div className='flex items-center gap-1.5 text-xs text-destructive mt-1'>
                <AlertCircle className='h-3.5 w-3.5 flex-shrink-0' />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className='flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50 text-xs'>
            <div className='flex items-center gap-2 text-muted-foreground'>
              <ShieldCheck className='h-4 w-4 text-emerald-600' />
              <span>Demo Family Passcode:</span>
            </div>
            <button
              type='button'
              onClick={() => handleQuickFill('CARE-8492')}
              className='font-mono font-bold text-primary hover:underline'
            >
              CARE-8492
            </button>
          </div>

          <div className='flex gap-2 pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              className='w-1/2'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='w-1/2 bg-primary text-primary-foreground font-semibold'
            >
              Unlock Portal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

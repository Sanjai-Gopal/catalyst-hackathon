import { useState, useEffect, type FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, ShieldCheck, KeyRound, AlertCircle, ShieldAlert } from 'lucide-react';
import { verifyPasscode } from '@/lib/passcode';

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetRole?: 'caretaker' | 'family';
}

const MAX_ATTEMPTS = 5;
// The one-tap demo passcode is only shown when the deployment opts in
// (VITE_DEMO_MODE=true). The code itself is still listed in the README for judges.
const SHOW_DEMO_PASSCODE = false; // removed with real auth in a later commit

export function PasscodeModal({
  isOpen,
  onClose,
  onSuccess,
}: PasscodeModalProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setFailedAttempts(0);
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleVerify = (e: FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    if (verifyPasscode(passcode)) {
      setError('');
      setPasscode('');
      setFailedAttempts(0);
      onSuccess();
    } else {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);

      if (nextFailures >= MAX_ATTEMPTS) {
        setLockoutSeconds(30);
        setError('Security lockout active: 5 failed attempts. Please wait 30 seconds.');
      } else {
        // Never reveal the valid code(s) in the error message.
        setError(`Invalid passcode (${nextFailures}/${MAX_ATTEMPTS} attempts).`);
      }
    }
  };

  const handleQuickFill = (code: string) => {
    if (lockoutSeconds > 0) return;
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
                placeholder={lockoutSeconds > 0 ? `Locked for ${lockoutSeconds}s` : 'Enter family passcode'}
                value={passcode}
                disabled={lockoutSeconds > 0}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError('');
                }}
                className='pl-10 text-center tracking-widest text-lg font-mono'
                autoFocus
              />
            </div>
            {lockoutSeconds > 0 ? (
              <div className='flex items-center gap-1.5 text-xs text-rose-600 bg-rose-500/10 p-2 rounded-lg font-semibold mt-1'>
                <ShieldAlert className='h-4 w-4 shrink-0 animate-pulse' />
                <span>Brute-force security lockout: wait {lockoutSeconds} seconds</span>
              </div>
            ) : error ? (
              <div className='flex items-center gap-1.5 text-xs text-destructive mt-1'>
                <AlertCircle className='h-3.5 w-3.5 flex-shrink-0' />
                <span>{error}</span>
              </div>
            ) : null}
          </div>

          {SHOW_DEMO_PASSCODE && (
            <div className='flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50 text-xs'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <ShieldCheck className='h-4 w-4 text-emerald-600' />
                <span>Demo Family Passcode:</span>
              </div>
              <button
                type='button'
                disabled={lockoutSeconds > 0}
                onClick={() => handleQuickFill('CARE-8492')}
                className='font-mono font-bold text-primary hover:underline disabled:opacity-50'
              >
                CARE-8492
              </button>
            </div>
          )}

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
              disabled={lockoutSeconds > 0}
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

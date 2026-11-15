import { useState } from 'react';
import {
  Pill,
  Truck,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { type Medication } from '@/types/carenest';

interface PharmacyRefillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  medications: Medication[];
  honorific?: string;
  onRefillMedication?: (medId: string) => void;
}

export function PharmacyRefillDialog({
  isOpen,
  onClose,
  medications,
  honorific = 'Amma',
  onRefillMedication,
}: PharmacyRefillDialogProps) {
  const [selectedPharmacy, setSelectedPharmacy] = useState<'apollo' | 'janaushadhi' | 'netmeds'>(
    'apollo'
  );
  const [refilledIds, setRefilledIds] = useState<string[]>([]);

  const handleRefillSingle = (med: Medication) => {
    setRefilledIds((prev) => [...prev, med.id]);
    if (onRefillMedication) {
      onRefillMedication(med.id);
    }
    toast.success(`Refill order submitted for ${med.name} (30 days supply)!`);
  };

  const handleRefillAllLowStock = () => {
    const lowStockMeds = medications.filter(
      (m) => m.remainingPills / m.totalPills <= 0.6
    );
    setRefilledIds(lowStockMeds.map((m) => m.id));
    toast.success(
      `Dispatched consolidated prescription refill order for ${lowStockMeds.length} medicines via Apollo Pharmacy!`,
      { duration: 4000 }
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center gap-2'>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground'>
              <Pill className='w-5 h-5' />
            </div>
            <div>
              <DialogTitle className='text-base font-bold flex items-center gap-2'>
                Smart Pill Inventory &amp; Auto-Refill
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Bottle inventory tracking and automated pharmacy replenishment for {honorific}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Pharmacy Partner Selector */}
        <div className='space-y-2 py-2' role='group' aria-labelledby='pharmacy-partner-label'>
          <p id='pharmacy-partner-label' className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
            Fulfilled by Partner Pharmacy
          </p>
          <div className='grid grid-cols-3 gap-2'>
            {[
              { id: 'apollo', name: 'Apollo Pharmacy', badge: '1-Hour Express', eta: 'Today 2 PM' },
              { id: 'janaushadhi', name: 'Jan Aushadhi', badge: 'Generic -85%', eta: 'Tomorrow' },
              { id: 'netmeds', name: 'Netmeds Care', badge: '15% Off', eta: 'Tomorrow' },
            ].map((pharm) => (
              <button
                key={pharm.id}
                type='button'
                onClick={() => setSelectedPharmacy(pharm.id as typeof selectedPharmacy)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  selectedPharmacy === pharm.id
                    ? 'border-primary bg-primary/10 font-bold shadow-sm'
                    : 'border-border/60 hover:bg-muted/40'
                }`}
              >
                <div className='font-semibold text-foreground'>{pharm.name}</div>
                <div className='text-[10px] text-primary mt-0.5'>{pharm.badge}</div>
                <div className='text-[10px] text-muted-foreground'>ETA: {pharm.eta}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Medication Supply Status List */}
        <div className='space-y-3 py-2'>
          <label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
            Active Prescriptions ({medications.length})
          </label>
          <div className='space-y-2.5'>
            {medications.map((med) => {
              const isRefilled = refilledIds.includes(med.id);
              const remaining = isRefilled ? med.totalPills : med.remainingPills;
              const percent = Math.round((remaining / med.totalPills) * 100);
              const isLowStock = percent <= 50;

              return (
                <div
                  key={med.id}
                  className='p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-col gap-2'
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-xs font-bold text-foreground flex items-center gap-1.5'>
                        {med.name}
                        {isLowStock && !isRefilled && (
                          <Badge variant='destructive' className='text-[9px] px-1.5 py-0'>
                            Low Stock
                          </Badge>
                        )}
                        {isRefilled && (
                          <Badge variant='outline' className='text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20'>
                            Refill Ordered
                          </Badge>
                        )}
                      </div>
                      <div className='text-[11px] text-muted-foreground'>
                        {med.dosage} • Prescribed by {med.prescribedBy.split('(')[0]}
                      </div>
                    </div>

                    <Button
                      size='sm'
                      variant={isLowStock && !isRefilled ? 'default' : 'outline'}
                      onClick={() => handleRefillSingle(med)}
                      disabled={isRefilled}
                      className='h-7 text-xs font-semibold'
                    >
                      {isRefilled ? 'Ordered ✓' : 'Refill +30'}
                    </Button>
                  </div>

                  {/* Stock Progress Bar */}
                  <div className='space-y-1'>
                    <div className='flex items-center justify-between text-[11px] font-mono'>
                      <span className='text-muted-foreground'>
                        {remaining} of {med.totalPills} tablets left ({Math.round(remaining / 1)} days)
                      </span>
                      <span className={isLowStock ? 'text-rose-500 font-bold' : 'text-muted-foreground'}>
                        {percent}%
                      </span>
                    </div>
                    <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isLowStock ? 'bg-rose-500' : 'bg-primary'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleRefillAllLowStock} className='gap-1.5'>
            <Truck className='w-4 h-4' />
            1-Click Order All Refills
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

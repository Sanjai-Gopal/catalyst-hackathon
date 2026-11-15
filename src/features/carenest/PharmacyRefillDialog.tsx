import { useState } from 'react'
import { type Medication } from '@/types/carenest'
import { Pill, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface PharmacyRefillDialogProps {
  isOpen: boolean
  onClose: () => void
  medications: Medication[]
  honorific?: string
  onRefillMedication?: (medId: string) => void
}

export function PharmacyRefillDialog({
  isOpen,
  onClose,
  medications,
  honorific = 'Amma',
  onRefillMedication,
}: PharmacyRefillDialogProps) {
  const [selectedPharmacy, setSelectedPharmacy] = useState<
    'apollo' | 'janaushadhi' | 'netmeds'
  >('apollo')
  const [refilledIds, setRefilledIds] = useState<string[]>([])

  const handleRefillSingle = (med: Medication) => {
    setRefilledIds((prev) => [...prev, med.id])
    if (onRefillMedication) {
      onRefillMedication(med.id)
    }
    toast.success(`Refill order submitted for ${med.name} (30 days supply)!`)
  }

  const handleRefillAllLowStock = () => {
    const lowStockMeds = medications.filter(
      (m) => m.remainingPills / m.totalPills <= 0.6
    )
    setRefilledIds(lowStockMeds.map((m) => m.id))
    toast.success(
      `Dispatched consolidated prescription refill order for ${lowStockMeds.length} medicines via Apollo Pharmacy!`,
      { duration: 4000 }
    )
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl'>
        <DialogHeader>
          <div className='flex items-center gap-2'>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground'>
              <Pill className='h-5 w-5' />
            </div>
            <div>
              <DialogTitle className='flex items-center gap-2 text-base font-bold'>
                Smart Pill Inventory &amp; Auto-Refill
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Bottle inventory tracking and automated pharmacy replenishment
                for {honorific}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Pharmacy Partner Selector */}
        <div
          className='space-y-2 py-2'
          role='group'
          aria-labelledby='pharmacy-partner-label'
        >
          <p
            id='pharmacy-partner-label'
            className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'
          >
            Fulfilled by Partner Pharmacy
          </p>
          <div className='grid grid-cols-3 gap-2'>
            {[
              {
                id: 'apollo',
                name: 'Apollo Pharmacy',
                badge: '1-Hour Express',
                eta: 'Today 2 PM',
              },
              {
                id: 'janaushadhi',
                name: 'Jan Aushadhi',
                badge: 'Generic -85%',
                eta: 'Tomorrow',
              },
              {
                id: 'netmeds',
                name: 'Netmeds Care',
                badge: '15% Off',
                eta: 'Tomorrow',
              },
            ].map((pharm) => (
              <button
                key={pharm.id}
                type='button'
                onClick={() =>
                  setSelectedPharmacy(pharm.id as typeof selectedPharmacy)
                }
                className={`rounded-xl border p-2.5 text-left text-xs transition-all ${
                  selectedPharmacy === pharm.id
                    ? 'border-primary bg-primary/10 font-bold shadow-sm'
                    : 'border-border/60 hover:bg-muted/40'
                }`}
              >
                <div className='font-semibold text-foreground'>
                  {pharm.name}
                </div>
                <div className='mt-0.5 text-[10px] text-primary'>
                  {pharm.badge}
                </div>
                <div className='text-[10px] text-muted-foreground'>
                  ETA: {pharm.eta}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Medication Supply Status List */}
        <div className='space-y-3 py-2'>
          <label className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
            Active Prescriptions ({medications.length})
          </label>
          <div className='space-y-2.5'>
            {medications.map((med) => {
              const isRefilled = refilledIds.includes(med.id)
              const remaining = isRefilled ? med.totalPills : med.remainingPills
              const percent = Math.round((remaining / med.totalPills) * 100)
              const isLowStock = percent <= 50

              return (
                <div
                  key={med.id}
                  className='flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 p-3'
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='flex items-center gap-1.5 text-xs font-bold text-foreground'>
                        {med.name}
                        {isLowStock && !isRefilled && (
                          <Badge
                            variant='destructive'
                            className='px-1.5 py-0 text-[9px]'
                          >
                            Low Stock
                          </Badge>
                        )}
                        {isRefilled && (
                          <Badge
                            variant='outline'
                            className='border-emerald-500/20 bg-emerald-500/10 text-[9px] text-emerald-600'
                          >
                            Refill Ordered
                          </Badge>
                        )}
                      </div>
                      <div className='text-[11px] text-muted-foreground'>
                        {med.dosage} • Prescribed by{' '}
                        {med.prescribedBy.split('(')[0]}
                      </div>
                    </div>

                    <Button
                      size='sm'
                      variant={
                        isLowStock && !isRefilled ? 'default' : 'outline'
                      }
                      onClick={() => handleRefillSingle(med)}
                      disabled={isRefilled}
                      className='h-7 text-xs font-semibold'
                    >
                      {isRefilled ? 'Ordered ✓' : 'Refill +30'}
                    </Button>
                  </div>

                  {/* Stock Progress Bar */}
                  <div className='space-y-1'>
                    <div className='flex items-center justify-between font-mono text-[11px]'>
                      <span className='text-muted-foreground'>
                        {remaining} of {med.totalPills} tablets left (
                        {Math.round(remaining / 1)} days)
                      </span>
                      <span
                        className={
                          isLowStock
                            ? 'font-bold text-rose-500'
                            : 'text-muted-foreground'
                        }
                      >
                        {percent}%
                      </span>
                    </div>
                    <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isLowStock ? 'bg-rose-500' : 'bg-primary'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleRefillAllLowStock} className='gap-1.5'>
            <Truck className='h-4 w-4' />
            1-Click Order All Refills
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

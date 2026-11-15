import { useState, type FormEvent } from 'react'
import { parsePrescriptionWithGemini } from '@/services/geminiHealthcare'
import { type Medication, type TimeSlot } from '@/types/carenest'
import { Sparkles, Pill, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface AddMedicationModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (medication: Medication) => void
}

export function AddMedicationModal({
  isOpen,
  onClose,
  onAdd,
}: AddMedicationModalProps) {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual')
  const [ocrText, setOcrText] = useState('')
  const [isParsing, setIsParsing] = useState(false)

  // Manual Form State
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [slot, setSlot] = useState<TimeSlot>('morning')
  const [time, setTime] = useState('08:00 AM')
  const [instructions, setInstructions] = useState('')
  const [purpose, setPurpose] = useState('')
  const [criticality, setCriticality] = useState<'high' | 'medium' | 'low'>(
    'medium'
  )
  const [prescribedBy, setPrescribedBy] = useState('')
  const [totalPills, setTotalPills] = useState(30)

  const resetForm = () => {
    setName('')
    setDosage('')
    setSlot('morning')
    setTime('08:00 AM')
    setInstructions('')
    setPurpose('')
    setCriticality('medium')
    setPrescribedBy('')
    setTotalPills(30)
    setOcrText('')
  }

  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Please enter medication name')
      return
    }

    const newMed: Medication = {
      id: `med_${Date.now()}`,
      name: name.trim(),
      dosage: dosage.trim() || '1 Tablet',
      slot,
      time,
      instructions: instructions.trim() || 'Take as advised by physician',
      purpose: purpose.trim() || 'General health maintenance',
      criticality,
      prescribedBy: prescribedBy.trim() || 'Primary Care Physician',
      remainingPills: totalPills,
      totalPills,
    }

    onAdd(newMed)
    toast.success(`Added ${newMed.name} to schedule`)
    resetForm()
    onClose()
  }

  const handleAiParse = async () => {
    if (!ocrText.trim()) {
      toast.error('Please paste prescription notes or medicine label text')
      return
    }

    setIsParsing(true)
    try {
      const results = await parsePrescriptionWithGemini(ocrText)
      if (results && results.length > 0) {
        const item = results[0]
        if (item.name) setName(item.name)
        if (item.dosage) setDosage(item.dosage)
        if (item.slot) setSlot(item.slot as TimeSlot)
        if (item.time) setTime(item.time)
        if (item.instructions) setInstructions(item.instructions)
        if (item.purpose) setPurpose(item.purpose)
        if (item.criticality)
          setCriticality(item.criticality as 'high' | 'medium' | 'low')

        setMode('manual')
        toast.success(
          'Successfully extracted prescription details with Gemini AI! Review and save.'
        )
      } else {
        toast.info(
          'No medication structured data found. Please enter manually.'
        )
      }
    } catch {
      toast.error('AI extraction timed out. Switched to manual input.')
      setMode('manual')
    } finally {
      setIsParsing(false)
    }
  }

  const loadSamplePrescription = () => {
    setOcrText(
      'Rx: Telmisartan 40mg once daily in morning after breakfast. Indication: Essential Hypertension. Prescribed by: Dr. Sundar, Apollo Heart Institute.'
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto border-border bg-card sm:max-w-lg'>
        <DialogHeader>
          <div className='flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              <Pill className='h-5 w-5' />
            </div>
            <div>
              <DialogTitle className='text-lg font-bold'>
                Add Medication to Schedule
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground'>
                Add manual details or use Google Gemini to parse prescription
                text.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Mode Switcher */}
        <div className='my-2 grid grid-cols-2 gap-2'>
          <Button
            type='button'
            variant={mode === 'manual' ? 'default' : 'outline'}
            onClick={() => setMode('manual')}
            size='sm'
            className='h-9 text-xs font-medium'
          >
            <FileText className='mr-1.5 h-3.5 w-3.5' />
            Manual Entry
          </Button>
          <Button
            type='button'
            variant={mode === 'ai' ? 'default' : 'outline'}
            onClick={() => setMode('ai')}
            size='sm'
            className='flex h-9 items-center justify-center text-xs font-medium'
          >
            <Sparkles className='mr-1.5 h-3.5 w-3.5 text-amber-500' />
            Gemini AI OCR Parser
          </Button>
        </div>

        {mode === 'ai' ? (
          <div className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <Label className='text-xs font-semibold'>
                  Paste Prescription Notes / Pill Label
                </Label>
                <button
                  type='button'
                  onClick={loadSamplePrescription}
                  className='text-xs text-primary hover:underline'
                >
                  Load Sample
                </button>
              </div>
              <Textarea
                placeholder='e.g., Rx: Rosuvastatin 10mg once daily at bedtime for cholesterol...'
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                rows={4}
                className='font-mono text-sm'
              />
            </div>

            <Button
              type='button'
              onClick={handleAiParse}
              disabled={isParsing}
              className='flex w-full items-center justify-center gap-2 bg-primary font-semibold text-primary-foreground'
            >
              {isParsing ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  <span>Gemini 2.5 Flash Extracting...</span>
                </>
              ) : (
                <>
                  <Sparkles className='h-4 w-4 text-amber-300' />
                  <span>Extract Medication with Gemini</span>
                </>
              )}
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleManualSubmit}
            className='space-y-3.5 py-1 text-sm'
          >
            <div className='space-y-1'>
              <Label className='text-xs font-semibold'>Medication Name *</Label>
              <Input
                placeholder='e.g., Metformin 500mg'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <Label className='text-xs font-semibold'>Dosage</Label>
                <Input
                  placeholder='e.g., 1 Tablet (500mg)'
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                />
              </div>

              <div className='space-y-1'>
                <Label className='text-xs font-semibold'>Time Slot</Label>
                <Select
                  value={slot}
                  onValueChange={(val) => setSlot(val as TimeSlot)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select slot' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='morning'>Morning (8:00 AM)</SelectItem>
                    <SelectItem value='afternoon'>
                      Afternoon (1:30 PM)
                    </SelectItem>
                    <SelectItem value='evening'>Evening (6:30 PM)</SelectItem>
                    <SelectItem value='night'>Night (9:00 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <Label className='text-xs font-semibold'>Scheduled Time</Label>
                <Input
                  placeholder='e.g., 08:30 AM'
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              <div className='space-y-1'>
                <Label className='text-xs font-semibold'>Criticality</Label>
                <Select
                  value={criticality}
                  onValueChange={(val) =>
                    setCriticality(val as 'high' | 'medium' | 'low')
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='high'>High (Life Essential)</SelectItem>
                    <SelectItem value='medium'>
                      Medium (Daily Regular)
                    </SelectItem>
                    <SelectItem value='low'>Low (Supplement)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-1'>
              <Label className='text-xs font-semibold'>Primary Purpose</Label>
              <Input
                placeholder='e.g., Blood Sugar Regulation'
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            <div className='space-y-1'>
              <Label className='text-xs font-semibold'>
                Doctor Instructions
              </Label>
              <Input
                placeholder='e.g., Take after food with warm water'
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <Label className='text-xs font-semibold'>Prescribed By</Label>
                <Input
                  placeholder='e.g., Dr. Ramanathan, MD'
                  value={prescribedBy}
                  onChange={(e) => setPrescribedBy(e.target.value)}
                />
              </div>

              <div className='space-y-1'>
                <Label className='text-xs font-semibold'>
                  Total Pills in Pack
                </Label>
                <Input
                  type='number'
                  value={totalPills}
                  onChange={(e) =>
                    setTotalPills(Number.parseInt(e.target.value, 10) || 30)
                  }
                />
              </div>
            </div>

            <div className='flex gap-2 pt-3'>
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
                className='w-1/2 bg-primary font-semibold text-primary-foreground'
              >
                Save Schedule
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

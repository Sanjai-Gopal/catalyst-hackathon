import { useState } from 'react';
import {
  Activity,
  Heart,
  Droplet,
  Wind,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { HealthVitalRecord } from '@/types/carenest';
import { INITIAL_VITALS } from '@/data/carenestInitialData';

interface VitalsTrackerWidgetProps {
  patientName?: string;
  honorific?: string;
}

export function VitalsTrackerWidget({
  patientName = 'Lakshmi Narayanan',
  honorific = 'Amma',
}: VitalsTrackerWidgetProps) {
  const [vitals, setVitals] = useState<HealthVitalRecord[]>(INITIAL_VITALS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [vitalType, setVitalType] = useState<HealthVitalRecord['vitalType']>('blood_pressure');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');

  const getVitalMeta = (type: HealthVitalRecord['vitalType']) => {
    switch (type) {
      case 'blood_pressure':
        return {
          label: 'Blood Pressure',
          unit: 'mmHg',
          icon: Activity,
          color: 'text-rose-500',
          bgColor: 'bg-rose-500/10',
          normalRange: '110/70 - 130/85',
        };
      case 'blood_glucose':
        return {
          label: 'Fasting Glucose',
          unit: 'mg/dL',
          icon: Droplet,
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          normalRange: '70 - 120 mg/dL',
        };
      case 'heart_rate':
        return {
          label: 'Heart Rate',
          unit: 'bpm',
          icon: Heart,
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10',
          normalRange: '60 - 100 bpm',
        };
      case 'spo2':
        return {
          label: 'Blood Oxygen (SpO2)',
          unit: '%',
          icon: Wind,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          normalRange: '95 - 100%',
        };
      default:
        return {
          label: 'Temperature',
          unit: '°F',
          icon: Activity,
          color: 'text-purple-500',
          bgColor: 'bg-purple-500/10',
          normalRange: '97.0 - 99.0 °F',
        };
    }
  };

  const handleAddVital = () => {
    if (!value.trim()) {
      toast.error('Please enter a measurement value.');
      return;
    }

    const meta = getVitalMeta(vitalType);
    const newRecord: HealthVitalRecord = {
      id: `vit_${Date.now()}`,
      vitalType,
      value: value.trim(),
      unit: meta.unit,
      status: 'normal',
      loggedAt: 'Just now',
      notes: notes.trim() || `Manual entry for ${honorific}`,
    };

    setVitals((prev) => [newRecord, ...prev.filter((v) => v.vitalType !== vitalType)]);
    setIsAddModalOpen(false);
    setValue('');
    setNotes('');
    toast.success(`Logged ${meta.label} for ${honorific}: ${value} ${meta.unit}`);
  };

  return (
    <Card className='border-border/60 shadow-sm'>
      <CardHeader className='pb-3'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <div className='flex items-center gap-2'>
              <CardTitle className='text-base font-bold flex items-center gap-2'>
                <Activity className='w-4 h-4 text-primary' />
                Clinical Vitals &amp; Biometric Trend
              </CardTitle>
              <Badge variant='outline' className='text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20'>
                Optimal Vitals
              </Badge>
            </div>
            <CardDescription className='text-xs mt-0.5'>
              Continuous telemetry monitoring for {honorific} ({patientName}).
            </CardDescription>
          </div>

          <Button
            size='sm'
            onClick={() => setIsAddModalOpen(true)}
            className='h-8 text-xs font-semibold gap-1.5'
          >
            <Plus className='w-3.5 h-3.5' />
            Log Reading
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
          {vitals.map((item) => {
            const meta = getVitalMeta(item.vitalType);
            const Icon = meta.icon;

            return (
              <div
                key={item.id}
                className='p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-all flex flex-col justify-between'
              >
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex items-center gap-2'>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.bgColor} ${meta.color}`}>
                      <Icon className='w-4 h-4' />
                    </div>
                    <span className='text-xs font-semibold text-muted-foreground'>
                      {meta.label}
                    </span>
                  </div>
                  <Badge variant='secondary' className='text-[10px] font-mono'>
                    {item.status}
                  </Badge>
                </div>

                <div className='flex items-baseline gap-1 my-1'>
                  <span className='text-2xl font-bold tracking-tight text-foreground'>
                    {item.value}
                  </span>
                  <span className='text-xs text-muted-foreground font-medium'>
                    {item.unit}
                  </span>
                </div>

                <div className='flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40 mt-2'>
                  <span>Range: {meta.normalRange}</span>
                  <span className='font-mono'>{item.loggedAt}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Log Vital Reading Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <TrendingUp className='w-5 h-5 text-primary' />
              Log Clinical Vitals for {honorific}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Record blood pressure, fasting glucose, or pulse for doctor review.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Select Measurement</Label>
              <div className='grid grid-cols-2 gap-2'>
                {[
                  { type: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg' },
                  { type: 'blood_glucose', label: 'Blood Glucose', unit: 'mg/dL' },
                  { type: 'heart_rate', label: 'Heart Rate', unit: 'bpm' },
                  { type: 'spo2', label: 'Blood Oxygen', unit: '%' },
                ].map((opt) => (
                  <button
                    key={opt.type}
                    type='button'
                    onClick={() => setVitalType(opt.type as HealthVitalRecord['vitalType'])}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                      vitalType === opt.type
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                        : 'border-border/60 hover:bg-muted/40'
                    }`}
                  >
                    <div>{opt.label}</div>
                    <div className='text-[10px] text-muted-foreground'>{opt.unit}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='vitalValue' className='text-xs font-semibold'>
                Measured Value ({getVitalMeta(vitalType).unit})
              </Label>
              <Input
                id='vitalValue'
                placeholder={
                  vitalType === 'blood_pressure'
                    ? 'e.g. 120/80'
                    : vitalType === 'blood_glucose'
                    ? 'e.g. 110'
                    : 'e.g. 72'
                }
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='vitalNotes' className='text-xs font-semibold'>
                Clinical Notes / Context
              </Label>
              <Input
                id='vitalNotes'
                placeholder='e.g. Measured 15 mins after morning walking'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVital}>
              Save to Health Vault
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  type PatientProfile,
  type Medication,
  type ElderHonorific,
  type TimeSlot,
} from '@/types/carenest';
import {
  Heart,
  UserCheck,
  Stethoscope,
  ShieldCheck,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { LanguageSwitcher } from '@/components/language-switcher';

interface CareCircleOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: PatientProfile, medications: Medication[]) => void;
  initialProfile?: PatientProfile;
  initialMeds?: Medication[];
}

const COMMON_CONDITIONS = [
  'Hypertension / High BP',
  'Type 2 Diabetes',
  'Mild Osteoarthritis / Joint Pain',
  'High Cholesterol',
  'Asthma / Breathing Issues',
  'Heart Condition',
  'Thyroid Imbalance',
  'Mild Cognitive / Memory Care',
];

export function CareCircleOnboardingModal({
  isOpen,
  onClose,
  onComplete,
  initialProfile,
  initialMeds = [],
}: CareCircleOnboardingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Elder Identity & Affectionate Honorific
  const [honorific, setHonorific] = useState<ElderHonorific>(
    initialProfile?.honorific || 'Amma'
  );
  const [customHonorific, setCustomHonorific] = useState(
    initialProfile?.customHonorific || ''
  );
  const [fullName, setFullName] = useState(initialProfile?.name || 'Lakshmi Narayanan');
  const [age, setAge] = useState(initialProfile?.age || 74);
  const [bloodGroup, setBloodGroup] = useState(initialProfile?.bloodGroup || 'B+ Positive');

  // Step 2: Health Issues
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    initialProfile?.medicalConditions || ['Hypertension / High BP', 'Type 2 Diabetes']
  );
  const [customCondition, setCustomCondition] = useState('');
  const [allergiesText, setAllergiesText] = useState(
    initialProfile?.allergies?.join(', ') || 'Penicillin, Sulfa drugs'
  );

  // Step 3: Current Daily Medications
  const [medsList, setMedsList] = useState<Medication[]>(
    initialMeds.length > 0
      ? initialMeds
      : [
          {
            id: 'med_init_01',
            name: 'Amlodipine (Norvasc)',
            dosage: '5mg - 1 Tablet',
            slot: 'morning',
            time: '08:00 AM',
            instructions: 'Take after breakfast with warm water',
            purpose: 'Blood Pressure Control',
            criticality: 'high',
            prescribedBy: 'Dr. R. Ramanathan, MD',
            remainingPills: 28,
            totalPills: 30,
          },
          {
            id: 'med_init_02',
            name: 'Metformin Hydrochloride',
            dosage: '500mg - 1 Tablet',
            slot: 'morning',
            time: '08:30 AM',
            instructions: 'Take with food to prevent gastric discomfort',
            purpose: 'Blood Sugar Regulation',
            criticality: 'high',
            prescribedBy: 'Dr. Priya Sundaram',
            remainingPills: 20,
            totalPills: 30,
          },
        ]
  );
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedSlot, setNewMedSlot] = useState<TimeSlot>('morning');
  const [newMedInstructions, setNewMedInstructions] = useState('');

  // Step 4: Circle of Care (Children's & Doctor's Email)
  const [childName, setChildName] = useState(
    initialProfile?.childrenContact?.name || 'Sanjai Gopal'
  );
  const [childEmail, setChildEmail] = useState(
    initialProfile?.childrenContact?.email || 'sanjai23062008g@gmail.com'
  );
  const [childPhone, setChildPhone] = useState(
    initialProfile?.childrenContact?.phone || '+91 98401 23456'
  );
  const [doctorName, setDoctorName] = useState(
    initialProfile?.doctorContact?.doctorName || 'Dr. R. Ramanathan, MD'
  );
  const [doctorSpecialty, setDoctorSpecialty] = useState(
    initialProfile?.doctorContact?.specialty || 'Senior Cardiologist'
  );
  const [doctorEmail, setDoctorEmail] = useState(
    initialProfile?.doctorContact?.email || 'dr.ramanathan@apollohospitals.com'
  );
  const [doctorPhone, setDoctorPhone] = useState(
    initialProfile?.doctorContact?.phone || '+91 44 2829 0200'
  );

  const activeHonorificLabel =
    honorific === 'Custom' ? customHonorific || 'Elder' : honorific;

  const toggleCondition = (cond: string) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const handleAddCustomCondition = () => {
    if (customCondition.trim() && !selectedConditions.includes(customCondition.trim())) {
      setSelectedConditions((prev) => [...prev, customCondition.trim()]);
      setCustomCondition('');
    }
  };

  const handleAddMedication = () => {
    if (!newMedName.trim()) {
      toast.error('Please enter medicine name');
      return;
    }
    const newMed: Medication = {
      id: `med_${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || '1 Tablet',
      slot: newMedSlot,
      time: newMedSlot === 'morning' ? '08:00 AM' : newMedSlot === 'afternoon' ? '01:30 PM' : newMedSlot === 'evening' ? '06:30 PM' : '09:00 PM',
      instructions: newMedInstructions.trim() || 'Take with water as advised by doctor',
      purpose: 'Prescribed healthcare management',
      criticality: 'medium',
      prescribedBy: doctorName || 'Primary Physician',
      remainingPills: 30,
      totalPills: 30,
    };
    setMedsList((prev) => [...prev, newMed]);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedInstructions('');
    toast.success(`Added ${newMed.name}`);
  };

  const handleRemoveMed = (id: string) => {
    setMedsList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleFinish = () => {
    const allergies = allergiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedProfile: PatientProfile = {
      id: initialProfile?.id || `pt_${Date.now()}`,
      name: fullName.trim() || 'Lakshmi Narayanan',
      honorific,
      customHonorific: customHonorific.trim(),
      age: Number(age) || 74,
      bloodGroup: bloodGroup.trim() || 'B+ Positive',
      passcode: initialProfile?.passcode || 'CARE-8492',
      medicalConditions: selectedConditions,
      allergies,
      childrenContact: {
        name: childName.trim(),
        relationship: 'Son / Daughter (Primary Caregiver)',
        phone: childPhone.trim(),
        email: childEmail.trim(),
      },
      doctorContact: {
        doctorName: doctorName.trim(),
        specialty: doctorSpecialty.trim(),
        clinic: 'Apollo Speciality Hospitals',
        phone: doctorPhone.trim(),
        email: doctorEmail.trim(),
      },
      emergencyContact: {
        name: childName.trim(),
        relationship: 'Primary Caregiver',
        phone: childPhone.trim(),
        email: childEmail.trim(),
      },
    };

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
      });
    } catch {
      // fallback
    }

    onComplete(updatedProfile, medsList);
    toast.success(`Care Circle for ${activeHonorificLabel} successfully established!`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-xl max-h-[90vh] overflow-y-auto bg-card border-border'>
        <DialogHeader>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                <Heart className='h-6 w-6' />
              </div>
              <div>
                <DialogTitle className='text-xl font-bold tracking-tight'>
                  Care Circle Onboarding & Setup
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground'>
                  Step {step} of 5: Connecting Elders, Children & Doctors.
                </DialogDescription>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </DialogHeader>

        {/* Step Indicator Progress Bar */}
        <div className='flex items-center justify-between gap-1 my-2'>
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* ================= STEP 1: AFFECTIONATE HONORIFIC & IDENTITY ================= */}
        {step === 1 && (
          <div className='space-y-4 py-2'>
            <div className='p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300'>
              💡 <strong>Affectionate Geriatric Experience:</strong> In our culture, we don't call our parents or elders by cold first names. Choose how CareNest AI should affectionately address them.
            </div>

            <div className='space-y-2'>
              <Label className='text-xs font-semibold'>How should CareNest address them? *</Label>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                {(['Amma', 'Appa', 'Grandma', 'Grandpa'] as ElderHonorific[]).map((opt) => (
                  <button
                    key={opt}
                    type='button'
                    onClick={() => setHonorific(opt)}
                    className={`p-3 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 ${
                      honorific === opt
                        ? 'border-primary bg-primary/10 text-primary shadow-sm scale-102'
                        : 'border-border bg-card hover:bg-muted text-foreground'
                    }`}
                  >
                    <span className='text-lg'>
                      {opt === 'Amma' ? '🌸' : opt === 'Appa' ? '🌿' : opt === 'Grandma' ? '👵' : '👴'}
                    </span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>

              <div className='pt-1'>
                <button
                  type='button'
                  onClick={() => setHonorific('Custom')}
                  className={`text-xs font-medium hover:underline ${
                    honorific === 'Custom' ? 'text-primary font-bold' : 'text-muted-foreground'
                  }`}
                >
                  Or enter custom nickname (e.g., Paati, Thaatha, Dadi, Nani)
                </button>
                {honorific === 'Custom' && (
                  <Input
                    placeholder='e.g., Paati'
                    value={customHonorific}
                    onChange={(e) => setCustomHonorific(e.target.value)}
                    className='mt-2'
                  />
                )}
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Official Name (for Doctor Prescriptions) *</Label>
              <Input
                placeholder='e.g., Lakshmi Narayanan'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Age</Label>
                <Input
                  type='number'
                  placeholder='e.g., 74'
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value) || 0)}
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Blood Group</Label>
                <Input
                  placeholder='e.g., B+ Positive'
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: HEALTH ISSUES & CONDITIONS ================= */}
        {step === 2 && (
          <div className='space-y-4 py-2'>
            <div className='text-xs text-muted-foreground'>
              Select all diagnosed medical conditions for <strong>{activeHonorificLabel}</strong>. Google Gemini uses this to audit drug-disease contraindications.
            </div>

            <div className='space-y-2'>
              <Label className='text-xs font-semibold'>Select Diagnosed Conditions</Label>
              <div className='flex flex-wrap gap-2'>
                {COMMON_CONDITIONS.map((cond) => {
                  const isSelected = selectedConditions.includes(cond);
                  return (
                    <button
                      key={cond}
                      type='button'
                      onClick={() => toggleCondition(cond)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-muted/50 border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      {isSelected && <Check className='w-3 h-3' />}
                      <span>{cond}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className='flex gap-2 pt-1'>
              <Input
                placeholder='Add other condition (e.g., Osteoporosis)...'
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomCondition())}
                className='text-xs h-9'
              />
              <Button
                type='button'
                onClick={handleAddCustomCondition}
                size='sm'
                variant='outline'
                className='h-9 text-xs'
              >
                <Plus className='w-3.5 h-3.5 mr-1' />
                Add
              </Button>
            </div>

            <div className='space-y-1.5 pt-2'>
              <Label className='text-xs font-semibold text-rose-600 dark:text-rose-400'>
                Known Allergies (Crucial for Doctor Safety)
              </Label>
              <Input
                placeholder='e.g., Penicillin, Sulfa drugs, Peanuts'
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                className='text-xs'
              />
            </div>
          </div>
        )}

        {/* ================= STEP 3: MEDICINES CONSUMED ================= */}
        {step === 3 && (
          <div className='space-y-4 py-2'>
            <div className='flex items-center justify-between'>
              <Label className='text-xs font-semibold'>
                Medicines {activeHonorificLabel} Consumes Daily ({medsList.length})
              </Label>
              <Badge variant='outline' className='text-[10px]'>
                Morning • Noon • Night
              </Badge>
            </div>

            {/* Existing List */}
            <div className='space-y-2 max-h-44 overflow-y-auto pr-1'>
              {medsList.map((m) => (
                <div
                  key={m.id}
                  className='p-2.5 rounded-xl border border-border/60 bg-muted/30 text-xs flex items-center justify-between'
                >
                  <div>
                    <span className='font-bold text-foreground'>{m.name}</span>{' '}
                    <span className='text-muted-foreground'>({m.dosage})</span>
                    <div className='text-[10px] text-primary font-mono capitalize'>
                      {m.slot} • {m.instructions}
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => handleRemoveMed(m.id)}
                    className='h-7 w-7 text-muted-foreground hover:text-destructive'
                  >
                    <Trash2 className='w-3.5 h-3.5' />
                  </Button>
                </div>
              ))}
            </div>

            {/* Quick Add Form */}
            <div className='p-3 rounded-xl border border-border bg-muted/20 space-y-2.5 text-xs'>
              <div className='font-semibold text-foreground flex items-center gap-1.5'>
                <Plus className='w-3.5 h-3.5 text-primary' />
                <span>Add Another Medicine</span>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <Input
                  placeholder='Medicine Name (e.g., Telmisartan)'
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className='text-xs h-8'
                />
                <Input
                  placeholder='Dosage (e.g., 40mg 1 tab)'
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className='text-xs h-8'
                />
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <select
                  value={newMedSlot}
                  onChange={(e) => setNewMedSlot(e.target.value as TimeSlot)}
                  className='h-8 rounded-md border border-input bg-background px-2 text-xs'
                >
                  <option value='morning'>Morning (8:00 AM)</option>
                  <option value='afternoon'>Afternoon (1:30 PM)</option>
                  <option value='evening'>Evening (6:30 PM)</option>
                  <option value='night'>Night (9:00 PM)</option>
                </select>
                <Input
                  placeholder='Instructions (e.g. after meals)'
                  value={newMedInstructions}
                  onChange={(e) => setNewMedInstructions(e.target.value)}
                  className='text-xs h-8'
                />
              </div>

              <Button
                type='button'
                onClick={handleAddMedication}
                size='sm'
                className='w-full h-8 text-xs bg-primary text-primary-foreground font-semibold'
              >
                + Save Medicine to Schedule
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: CIRCLE OF CARE (CHILDREN & DOCTOR) ================= */}
        {step === 4 && (
          <div className='space-y-4 py-2 text-xs'>
            {/* Children Details */}
            <div className='p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-2.5'>
              <div className='flex items-center gap-2 font-bold text-foreground text-sm'>
                <UserCheck className='w-4 h-4 text-primary' />
                <span>Children / Primary Family Caregiver Contact</span>
              </div>
              <p className='text-muted-foreground text-[11px]'>
                This child receives real-time email reminders when {activeHonorificLabel} misses a dose or triggers SOS.
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                <div className='space-y-1'>
                  <Label className='text-[11px] font-semibold'>Child's Name</Label>
                  <Input
                    placeholder='e.g., Sanjai Gopal'
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className='h-8 text-xs'
                  />
                </div>
                <div className='space-y-1'>
                  <Label className='text-[11px] font-semibold'>Child's Email *</Label>
                  <Input
                    type='email'
                    placeholder='e.g., child@gmail.com'
                    value={childEmail}
                    onChange={(e) => setChildEmail(e.target.value)}
                    className='h-8 text-xs'
                    required
                  />
                </div>
              </div>
              <div className='space-y-1'>
                <Label className='text-[11px] font-semibold'>Child's Phone / WhatsApp</Label>
                <Input
                  placeholder='e.g., +91 98401 23456'
                  value={childPhone}
                  onChange={(e) => setChildPhone(e.target.value)}
                  className='h-8 text-xs'
                />
              </div>
            </div>

            {/* Doctor Details */}
            <div className='p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-2.5'>
              <div className='flex items-center gap-2 font-bold text-foreground text-sm'>
                <Stethoscope className='w-4 h-4 text-indigo-600' />
                <span>Treating Doctor / Physician Contact</span>
              </div>
              <p className='text-muted-foreground text-[11px]'>
                Treating physician receives appointment confirmations and critical medication changes.
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                <div className='space-y-1'>
                  <Label className='text-[11px] font-semibold'>Doctor's Name</Label>
                  <Input
                    placeholder='e.g., Dr. R. Ramanathan, MD'
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className='h-8 text-xs'
                  />
                </div>
                <div className='space-y-1'>
                  <Label className='text-[11px] font-semibold'>Doctor's Email *</Label>
                  <Input
                    type='email'
                    placeholder='e.g., doctor@hospital.com'
                    value={doctorEmail}
                    onChange={(e) => setDoctorEmail(e.target.value)}
                    className='h-8 text-xs'
                    required
                  />
                </div>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                <div className='space-y-1'>
                  <Label className='text-[11px] font-semibold'>Specialty</Label>
                  <Input
                    placeholder='e.g., Senior Cardiologist'
                    value={doctorSpecialty}
                    onChange={(e) => setDoctorSpecialty(e.target.value)}
                    className='h-8 text-xs'
                  />
                </div>
                <div className='space-y-1'>
                  <Label className='text-[11px] font-semibold'>Hospital / Clinic Phone</Label>
                  <Input
                    placeholder='e.g., +91 44 2829 0200'
                    value={doctorPhone}
                    onChange={(e) => setDoctorPhone(e.target.value)}
                    className='h-8 text-xs'
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: REVIEW & PASSCODE GENERATION ================= */}
        {step === 5 && (
          <div className='space-y-4 py-2 text-xs'>
            <div className='text-center space-y-1 pb-2'>
              <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-1'>
                <Sparkles className='h-6 w-6' />
              </div>
              <h3 className='text-lg font-bold text-foreground'>
                {activeHonorificLabel}'s Care Circle is Ready!
              </h3>
              <p className='text-muted-foreground text-xs'>
                Everything is configured for harmonious geriatric care between {activeHonorificLabel}, children, and doctor.
              </p>
            </div>

            <div className='p-4 rounded-2xl bg-card border border-border shadow-sm space-y-3'>
              <div className='flex items-center justify-between pb-2 border-b border-border'>
                <div>
                  <span className='text-xs text-muted-foreground uppercase font-semibold'>Elder Name & Honorific:</span>
                  <div className='font-bold text-base text-foreground'>
                    {fullName} ({activeHonorificLabel})
                  </div>
                </div>
                <Badge className='bg-primary text-primary-foreground font-mono'>
                  Passcode: CARE-8492
                </Badge>
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <span className='text-muted-foreground'>Diagnosed Issues:</span>
                  <div className='font-medium text-foreground'>{selectedConditions.join(', ')}</div>
                </div>
                <div>
                  <span className='text-muted-foreground'>Daily Medicines:</span>
                  <div className='font-medium text-foreground'>{medsList.length} prescribed tablets</div>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-2 pt-1 border-t border-border'>
                <div>
                  <span className='text-muted-foreground'>Child's Email:</span>
                  <div className='font-semibold text-primary'>{childEmail}</div>
                </div>
                <div>
                  <span className='text-muted-foreground'>Doctor's Email:</span>
                  <div className='font-semibold text-indigo-600'>{doctorEmail}</div>
                </div>
              </div>
            </div>

            <div className='p-3 rounded-xl bg-muted/50 border border-border/60 text-muted-foreground text-[11px] flex items-center gap-2'>
              <ShieldCheck className='w-4 h-4 text-emerald-600 flex-shrink-0' />
              <span>
                {activeHonorificLabel} can now use the high-contrast 1-Tap Safe Mode, while children and doctors stay proactively alerted.
              </span>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className='flex items-center justify-between pt-3 border-t border-border'>
          {step > 1 ? (
            <Button
              type='button'
              variant='outline'
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4 | 5)}
              size='sm'
              className='text-xs'
            >
              <ArrowLeft className='w-3.5 h-3.5 mr-1.5' />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <Button
              type='button'
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3 | 4 | 5)}
              size='sm'
              className='text-xs bg-primary text-primary-foreground font-semibold'
            >
              Next
              <ArrowRight className='w-3.5 h-3.5 ml-1.5' />
            </Button>
          ) : (
            <Button
              type='button'
              onClick={handleFinish}
              size='sm'
              className='text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md'
            >
              <Sparkles className='w-3.5 h-3.5 mr-1.5' />
              Launch {activeHonorificLabel}'s Care Ecosystem
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

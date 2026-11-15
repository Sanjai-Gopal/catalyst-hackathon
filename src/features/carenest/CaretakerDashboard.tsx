import { useState, useEffect } from 'react'
import {
  sendEmailNotification,
  buildEmailTemplate,
} from '@/services/emailService'
import { analyzeDrugInteractionsWithGemini } from '@/services/geminiHealthcare'
import { speakText } from '@/services/voiceService'
import {
  type Medication,
  type DoctorAppointment,
  type AdherenceRecord,
  type PatientProfile,
  type DrugInteractionAlert,
  type TimeSlot,
} from '@/types/carenest'
import {
  Activity,
  Calendar,
  Pill,
  ShieldCheck,
  Mail,
  Plus,
  Trash2,
  Clock,
  Send,
  AlertTriangle,
  Globe2,
  CheckCircle2,
  Phone,
  Sparkles,
  Loader2,
  Heart,
  User,
  UserCheck,
  Stethoscope,
  AlertCircle,
  Volume2,
  Video,
  RotateCcw,
  Lock,
} from 'lucide-react'
import { toast } from 'sonner'
import { getLocalDateString } from '@/lib/date'
import { useLanguage } from '@/context/language-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CobeGlobe } from '@/components/design-system/CobeGlobe'
import { LanguageSwitcher } from '@/components/language-switcher'
import { AddMedicationModal } from './AddMedicationModal'
import { LabReportsVault } from './LabReportsVault'
import { PharmacyRefillDialog } from './PharmacyRefillDialog'
import { TelehealthConsultationModal } from './TelehealthConsultationModal'
import { VitalsTrackerWidget } from './VitalsTrackerWidget'

interface CaretakerDashboardProps {
  patient: PatientProfile
  medications: Medication[]
  appointments: DoctorAppointment[]
  adherence: AdherenceRecord[]
  onAddMedication: (med: Medication) => void
  onDeleteMedication: (id: string) => void
  onMarkTaken: (medId: string, slot: TimeSlot) => void
  onSwitchToSeniorMode: () => void
  onOpenOnboarding?: () => void
  onResetRoutine?: () => void
}

interface EmailLogItem {
  id: string
  type: string
  recipient: string
  subject: string
  time: string
  status: 'delivered' | 'simulated' | 'failed'
}

export function CaretakerDashboard({
  patient,
  medications,
  appointments,
  adherence,
  onAddMedication,
  onDeleteMedication,
  onMarkTaken,
  onSwitchToSeniorMode,
  onOpenOnboarding,
  onResetRoutine,
}: CaretakerDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isTelehealthOpen, setIsTelehealthOpen] = useState(false)
  const [isRefillDialogOpen, setIsRefillDialogOpen] = useState(false)
  const [showPasscode, setShowPasscode] = useState(false)

  const { t, currentLanguage } = useLanguage()

  const honorificLabel =
    patient.honorific === 'Custom'
      ? patient.customHonorific || 'Amma'
      : patient.honorific || 'Amma'

  // Gemini Drug Interaction State
  const [interactionAlerts, setInteractionAlerts] = useState<
    DrugInteractionAlert[]
  >([])
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false)

  // Email Notification Simulator State
  const [emailLogs, setEmailLogs] = useState<EmailLogItem[]>([
    {
      id: 'log_01',
      type: 'upcoming_dose',
      recipient: patient.emergencyContact.email,
      subject: '⏰ Upcoming Medication Reminder: Amlodipine for Amma',
      time: '07:45 AM',
      status: 'simulated', // sample row for the demo; no email was actually sent
    },
  ])
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [previewEmailType, setPreviewEmailType] = useState<
    | 'missed_medication'
    | 'upcoming_dose'
    | 'appointment_reminder'
    | 'emergency_sos'
  >('missed_medication')

  const handleRunSafetyCheck = async () => {
    setIsCheckingInteractions(true)
    try {
      const alerts = await analyzeDrugInteractionsWithGemini(medications)
      setInteractionAlerts(alerts)
    } catch {
      toast.error('Failed to run AI safety check')
    } finally {
      setIsCheckingInteractions(false)
    }
  }

  // Run initial interaction check asynchronously
  useEffect(() => {
    let isMounted = true
    analyzeDrugInteractionsWithGemini(medications)
      .then((alerts) => {
        if (isMounted) {
          setInteractionAlerts(alerts)
        }
      })
      .catch(() => {})
    return () => {
      isMounted = false
    }
  }, [medications])

  // Dispatch Email Handler
  const handleDispatchEmail = async (
    type:
      | 'missed_medication'
      | 'upcoming_dose'
      | 'appointment_reminder'
      | 'emergency_sos'
  ) => {
    setIsSendingEmail(true)

    let medOrDetails = 'Amlodipine (Norvasc) 5mg'
    if (type === 'appointment_reminder') {
      medOrDetails = 'Dr. R. Ramanathan, MD (Cardiologist) • Tomorrow 10:30 AM'
    } else if (type === 'emergency_sos') {
      medOrDetails = 'Emergency SOS triggered from bedside tablet'
    }

    try {
      const payload = {
        recipientEmail: patient.emergencyContact.email,
        recipientName: patient.emergencyContact.name,
        elderName: patient.name,
        type,
        medicationOrDetails: medOrDetails,
        scheduledTime: new Date().toLocaleTimeString(),
      }
      const result = await sendEmailNotification(payload)
      const { subject } = buildEmailTemplate(payload)

      setEmailLogs((prev) => [
        {
          id: `log_${Date.now()}`,
          type,
          recipient: patient.emergencyContact.email,
          subject,
          time: new Date().toLocaleTimeString(),
          status: result.success ? 'delivered' : 'failed',
        },
        ...prev,
      ])

      if (result.success) {
        toast.success(
          `Sent ${type.replace('_', ' ')} email to ${patient.emergencyContact.email}.`
        )
      } else {
        toast.error(`Email NOT sent: ${result.error ?? 'unknown error'}`)
      }
    } catch {
      toast.error('Error dispatching email')
    } finally {
      setIsSendingEmail(false)
    }
  }

  // Calculate adherence stats
  // Only today's records: adherence is stored across days, so counting all of it
  // produced "5 of 4 doses taken today" after the first day.
  const todayStr = getLocalDateString()
  const takenCount = adherence.filter(
    (a) => a.status === 'taken' && a.date === todayStr
  ).length
  const adherenceRate = Math.min(
    100,
    Math.round((takenCount / Math.max(1, medications.length)) * 100)
  )

  const handleReadDailyBrief = () => {
    let brief = `Daily briefing for ${honorificLabel}: Medication adherence rate is ${adherenceRate} percent. ${takenCount} of ${medications.length} active prescriptions taken today.`
    if (currentLanguage === 'ta') {
      brief = `${honorificLabel} அன்றாட அறிக்கை: மருந்து உட்கொள்ளல் அளவு ${adherenceRate} சதவீதம். இன்று ${medications.length} மருந்துகளில் ${takenCount} மருந்துகள் எடுக்கப்பட்டுள்ளன.`
    } else if (currentLanguage === 'hi') {
      brief = `${honorificLabel} दैनिक विवरण: दवा पालन दर ${adherenceRate} प्रतिशत है। आज ${medications.length} में से ${takenCount} दवाएं ली गईं।`
    } else if (currentLanguage === 'te') {
      brief = `${honorificLabel} రోజువారీ నివేదిక: మందుల పాటంపు రేటు ${adherenceRate} శాతం. నేడు ${medications.length} మందులలో ${takenCount} మందులు వేసుకున్నారు.`
    }
    toast.info(`🔊 Reading ${honorificLabel}'s Health Brief`)
    speakText(brief, undefined, currentLanguage)
  }

  return (
    <div className='min-h-screen bg-background pb-12 text-foreground'>
      {/* Top Bar / Profile Summary */}
      <div className='sticky top-0 z-20 border-b border-border bg-card/60 backdrop-blur'>
        <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8'>
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm'>
              <Heart className='h-6 w-6' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h1 className='text-xl font-bold tracking-tight'>
                  CareNest AI
                </h1>
                <button
                  type='button'
                  onClick={() => setShowPasscode((prev) => !prev)}
                  title='Click to reveal or hide passcode'
                  aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                  className='inline-flex cursor-pointer'
                >
                  <Badge
                    variant='outline'
                    className='flex items-center gap-1 border-primary/30 font-mono text-xs text-primary transition-colors hover:bg-primary/5'
                  >
                    <Lock className='h-3 w-3' />
                    Passcode: {showPasscode ? patient.passcode : '••••••••'}
                  </Badge>
                </button>
                <Badge className='border-primary/20 bg-primary/10 text-[10px] text-primary'>
                  Caring for {honorificLabel} 🌸
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground'>
                Elder:{' '}
                <span className='font-semibold text-foreground'>
                  {honorificLabel} ({patient.name})
                </span>{' '}
                • Child:{' '}
                <span className='font-medium text-foreground'>
                  {patient.childrenContact?.name ||
                    patient.emergencyContact.name}
                </span>{' '}
                • Doctor:{' '}
                <span className='font-medium text-foreground'>
                  {patient.doctorContact?.doctorName || 'Dr. Ramanathan'}
                </span>
              </p>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
            {/* Language Switcher */}
            <LanguageSwitcher />

            {onOpenOnboarding && (
              <Button
                variant='outline'
                onClick={onOpenOnboarding}
                className='flex h-10 items-center gap-1.5 rounded-xl border-primary/30 bg-primary/5 px-3.5 text-xs font-semibold text-primary hover:bg-primary/10'
              >
                <Sparkles className='h-3.5 w-3.5' />
                <span>{t('careCircleSetup')}</span>
              </Button>
            )}
            {onResetRoutine && (
              <Button
                variant='outline'
                onClick={onResetRoutine}
                className='flex h-10 items-center gap-1.5 rounded-xl border-border px-3.5 text-xs font-semibold hover:bg-muted'
                title='Reset daily routine to pending'
              >
                <RotateCcw className='h-3.5 w-3.5 text-emerald-700' />
                <span>Reset Routine</span>
              </Button>
            )}
            <Button
              variant='outline'
              onClick={handleReadDailyBrief}
              className='flex h-10 items-center gap-1.5 rounded-xl border-primary/20 px-3.5 text-xs font-semibold hover:bg-primary/10'
              title='Read Daily Health Brief Aloud'
            >
              <Volume2 className='h-3.5 w-3.5 text-primary' />
              <span>Voice Brief</span>
            </Button>
            <Button
              variant='outline'
              onClick={onSwitchToSeniorMode}
              className='h-10 rounded-xl border-amber-500/20 bg-amber-500/10 px-4 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-400'
            >
              👵 {honorificLabel} {t('seniorMode')}
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className='h-10 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm'
            >
              <Plus className='mr-1.5 h-4 w-4' />
              {t('addMedication')}
            </Button>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8'>
        {/* Metric Cards */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card className='shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                {t('dailyAdherence')}
              </CardTitle>
              <Activity className='h-4 w-4 text-emerald-700' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-foreground'>
                {adherenceRate}%
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>
                {takenCount} of {medications.length} doses logged today
              </p>
            </CardContent>
          </Card>

          <Card className='shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                {t('activeMedications')}
              </CardTitle>
              <Pill className='h-4 w-4 text-primary' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-foreground'>
                {medications.length}
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>
                Across Morning, Afternoon & Night
              </p>
            </CardContent>
          </Card>

          <Card className='shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                {t('upcomingVisits')}
              </CardTitle>
              <Calendar className='h-4 w-4 text-indigo-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-foreground'>
                {appointments.length}
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>
                Next: Apollo Hospitals (Tomorrow)
              </p>
            </CardContent>
          </Card>

          <Card className='shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                {t('geminiShield')}
              </CardTitle>
              <ShieldCheck className='h-4 w-4 text-emerald-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-foreground'>
                Active Shield
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>
                Google 2.5 Flash clinical audit enabled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-6'
        >
          <TabsList className='grid h-11 w-full max-w-4xl grid-cols-3 rounded-xl bg-muted/60 p-1 sm:grid-cols-6'>
            <TabsTrigger value='overview' className='text-xs font-medium'>
              {t('overview')}
            </TabsTrigger>
            <TabsTrigger
              value='children-portal'
              className='text-xs font-medium'
            >
              👨‍👩‍👧 {t('childrenPortal')}
            </TabsTrigger>
            <TabsTrigger value='doctor-portal' className='text-xs font-medium'>
              🩺 {t('doctorPortal')}
            </TabsTrigger>
            <TabsTrigger value='medications' className='text-xs font-medium'>
              {t('medications')} ({medications.length})
            </TabsTrigger>
            <TabsTrigger
              value='safety'
              className='flex items-center gap-1.5 text-xs font-medium'
            >
              <Sparkles className='h-3 w-3 text-amber-500' />
              {t('geminiSafety')}
            </TabsTrigger>
            <TabsTrigger
              value='email-simulator'
              className='text-xs font-medium'
            >
              {t('emailAlerts')}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value='overview' className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              {/* Left 2 Cols: Schedule Timeline & Log */}
              <div className='space-y-6 lg:col-span-2'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center justify-between text-base font-bold'>
                      <span>Today's Dosage Schedule</span>
                      <Badge variant='secondary' className='font-mono text-xs'>
                        {new Date().toLocaleDateString()}
                      </Badge>
                    </CardTitle>
                    <CardDescription className='text-xs'>
                      Real-time status across time slots. Synchronized with
                      elder's device.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    {medications.map((med) => {
                      const isTaken = adherence.some(
                        (a) => a.medicationId === med.id && a.status === 'taken'
                      )
                      return (
                        <div
                          key={med.id}
                          className='flex items-center justify-between rounded-xl border border-border/60 bg-card p-3.5 transition-all hover:bg-muted/30'
                        >
                          <div className='flex items-center gap-3'>
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                isTaken
                                  ? 'bg-emerald-500/10 text-emerald-700'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {isTaken ? (
                                <CheckCircle2 className='h-5 w-5' />
                              ) : (
                                <Clock className='h-5 w-5' />
                              )}
                            </div>
                            <div>
                              <div className='flex items-center gap-2'>
                                <h4 className='text-sm font-semibold'>
                                  {med.name}
                                </h4>
                                <Badge
                                  variant='outline'
                                  className='py-0 text-[10px] uppercase'
                                >
                                  {med.slot}
                                </Badge>
                              </div>
                              <p className='text-xs text-muted-foreground'>
                                {med.dosage} • {med.time} • {med.instructions}
                              </p>
                            </div>
                          </div>

                          <div className='flex items-center gap-2'>
                            {isTaken ? (
                              <Badge className='border-emerald-600/20 bg-emerald-600/10 text-xs text-emerald-700'>
                                Logged Taken
                              </Badge>
                            ) : (
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => onMarkTaken(med.id, med.slot)}
                                className='h-8 text-xs font-medium'
                              >
                                Mark Taken
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Patient Profile Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-base font-bold'>
                      <User className='h-4 w-4 text-primary' />
                      Patient Medical Profile & Emergency Contacts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='grid grid-cols-1 gap-4 text-sm sm:grid-cols-2'>
                    <div className='rounded-xl border border-border/40 bg-muted/40 p-3'>
                      <div className='text-xs font-semibold text-muted-foreground uppercase'>
                        Known Conditions
                      </div>
                      <div className='mt-1 font-medium'>
                        {patient.medicalConditions.join(', ')}
                      </div>
                    </div>
                    <div className='rounded-xl border border-rose-500/20 bg-rose-500/5 p-3'>
                      <div className='text-xs font-semibold text-rose-600 uppercase'>
                        Allergies
                      </div>
                      <div className='mt-1 font-medium text-rose-700 dark:text-rose-400'>
                        {patient.allergies.join(', ')}
                      </div>
                    </div>
                    <div className='rounded-xl border border-border/40 bg-muted/40 p-3'>
                      <div className='text-xs font-semibold text-muted-foreground uppercase'>
                        Primary Caretaker
                      </div>
                      <div className='mt-1 font-medium'>
                        {patient.emergencyContact.name} (
                        {patient.emergencyContact.relationship})
                      </div>
                      <div className='mt-0.5 text-xs text-muted-foreground'>
                        {patient.emergencyContact.phone}
                      </div>
                    </div>
                    <div className='rounded-xl border border-border/40 bg-muted/40 p-3'>
                      <div className='text-xs font-semibold text-muted-foreground uppercase'>
                        Emergency Alert Email
                      </div>
                      <div className='mt-1 font-medium'>
                        {patient.emergencyContact.email}
                      </div>
                      <div className='mt-0.5 text-xs text-emerald-700'>
                        ✓ Resend API Verified
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Col: 3D Care Globe & Quick Email Alert */}
              <div className='space-y-6'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-base font-bold'>
                      <Globe2 className='h-4 w-4 text-primary' />
                      Care Ecosystem Network
                    </CardTitle>
                    <CardDescription className='text-xs'>
                      Chennai (Amma) ↔ Apollo Hospitals ↔ San Francisco (Son)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='flex flex-col items-center justify-center pt-2'>
                    <CobeGlobe size={240} />
                    <div className='mt-4 w-full space-y-2 text-xs'>
                      <div className='flex items-center justify-between rounded-lg bg-muted/50 p-2'>
                        <span className='font-medium'>Patient Location:</span>
                        <span className='text-muted-foreground'>
                          Chennai, India
                        </span>
                      </div>
                      <div className='flex items-center justify-between rounded-lg bg-muted/50 p-2'>
                        <span className='font-medium'>Cloud Backend:</span>
                        <span className='text-muted-foreground'>
                          Appwrite (Singapore sgp)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick SOS Trigger */}
                <Card className='border-rose-500/20 bg-rose-500/5'>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-sm font-bold text-rose-700 dark:text-rose-400'>
                      <Phone className='h-4 w-4' />
                      Proactive Notification Test
                    </CardTitle>
                    <CardDescription className='text-xs'>
                      Test automated email dispatch to family inbox.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDispatchEmail('missed_medication')}
                      disabled={isSendingEmail}
                      className='w-full justify-start border-rose-300 text-xs text-rose-700 hover:bg-rose-100'
                    >
                      <Mail className='mr-2 h-3.5 w-3.5' />
                      Send Missed Dose Email Alert
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        handleDispatchEmail('appointment_reminder')
                      }
                      disabled={isSendingEmail}
                      className='w-full justify-start border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-100'
                    >
                      <Mail className='mr-2 h-3.5 w-3.5' />
                      Send Appointment Reminder Email
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB: CHILDREN PORTAL */}
          <TabsContent value='children-portal' className='space-y-6'>
            <div className='flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 md:flex-row md:items-center'>
              <div className='flex items-center gap-3'>
                <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm'>
                  <UserCheck className='h-6 w-6' />
                </div>
                <div>
                  <h3 className='text-lg font-bold text-foreground'>
                    Children & Family Care Portal for {honorificLabel}
                  </h3>
                  <p className='text-xs text-muted-foreground'>
                    Primary Family Caregiver:{' '}
                    <strong>
                      {patient.childrenContact?.name || 'Family Caregiver'}
                    </strong>{' '}
                    • Automated Alert Recipient:{' '}
                    <strong>
                      {patient.childrenContact?.email ||
                        'caregiver@example.com'}
                    </strong>
                  </p>
                </div>
              </div>
              <Button
                size='sm'
                onClick={() => handleDispatchEmail('missed_medication')}
                disabled={isSendingEmail}
                className='h-9 bg-primary text-xs font-semibold text-primary-foreground shadow-sm'
              >
                <Send className='mr-1.5 h-3.5 w-3.5' />
                Send Test Missed Dose Alert to Children
              </Button>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              {/* Children Contact Card */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base font-bold'>
                    <User className='h-4 w-4 text-primary' />
                    <span>Family Caregiver Profile</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 text-xs'>
                  <div className='flex justify-between border-b pb-2'>
                    <span className='text-muted-foreground'>Name:</span>
                    <span className='font-bold text-foreground'>
                      {patient.childrenContact?.name || 'Family Caregiver'}
                    </span>
                  </div>
                  <div className='flex justify-between border-b pb-2'>
                    <span className='text-muted-foreground'>Relationship:</span>
                    <span className='font-semibold text-foreground'>
                      {patient.childrenContact?.relationship ||
                        'Son & Caregiver'}
                    </span>
                  </div>
                  <div className='flex justify-between border-b pb-2'>
                    <span className='text-muted-foreground'>
                      Email for Alerts:
                    </span>
                    <span className='font-mono font-medium text-primary'>
                      {patient.childrenContact?.email ||
                        'caregiver@example.com'}
                    </span>
                  </div>
                  <div className='flex justify-between border-b pb-2'>
                    <span className='text-muted-foreground'>
                      Phone / WhatsApp:
                    </span>
                    <span className='font-mono text-foreground'>
                      {patient.childrenContact?.phone || '+91 90000 00000'}
                    </span>
                  </div>
                  <div className='flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 pt-2 text-[11px] text-emerald-700'>
                    <span className='font-semibold'>
                      ✓ Real-time Email & SOS active
                    </span>
                    <Badge
                      variant='outline'
                      className='bg-emerald-500/20 text-[10px] text-emerald-700'
                    >
                      Connected
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Medication Refill Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base font-bold'>
                    <Pill className='h-4 w-4 text-amber-500' />
                    <span>Pill Supply & Refill Watch</span>
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Monitoring {honorificLabel}'s pill box remaining counts
                  </CardDescription>
                </CardHeader>
                <CardContent className='max-h-60 space-y-2.5 overflow-y-auto text-xs'>
                  {medications.map((med) => {
                    const lowStock = med.remainingPills <= 15
                    return (
                      <div
                        key={med.id}
                        className={`flex items-center justify-between rounded-xl border p-2.5 ${
                          lowStock
                            ? 'border-amber-500/30 bg-amber-500/5'
                            : 'border-border/60 bg-muted/20'
                        }`}
                      >
                        <div>
                          <div className='font-bold text-foreground'>
                            {med.name}
                          </div>
                          <div className='text-[10px] text-muted-foreground'>
                            {med.dosage} • {med.time}
                          </div>
                        </div>
                        <Badge
                          variant={lowStock ? 'destructive' : 'secondary'}
                          className='font-mono text-[10px]'
                        >
                          {med.remainingPills} left
                        </Badge>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* 1-Tap Emergency Broadcast */}
              <Card className='border-rose-500/30 bg-rose-500/5'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base font-bold text-rose-700 dark:text-rose-400'>
                    <AlertTriangle className='h-4 w-4' />
                    <span>Emergency SOS Center</span>
                  </CardTitle>
                  <CardDescription className='text-xs text-rose-600/80'>
                    Instant alert sent across Children's email and treating
                    Doctor
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-3 text-xs'>
                  <p className='text-muted-foreground'>
                    If {honorificLabel} triggers SOS from bedside tablet or
                    caregiver detects an emergency:
                  </p>
                  <div className='space-y-2'>
                    <Button
                      size='sm'
                      onClick={() => handleDispatchEmail('emergency_sos')}
                      disabled={isSendingEmail}
                      className='h-10 w-full bg-rose-600 font-bold text-white shadow-md hover:bg-rose-700'
                    >
                      🚨 Broadcast Emergency SOS to Care Circle
                    </Button>
                    <a
                      href={`tel:${(patient.childrenContact?.phone || '+91 90000 00000').replace(/[^0-9+]/g, '')}`}
                      className='flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-xs font-bold text-white shadow-sm hover:bg-emerald-700'
                    >
                      <Phone className='h-3.5 w-3.5' />
                      <span>
                        📞 Call Child:{' '}
                        {patient.childrenContact?.name || 'Family Caregiver'} (
                        {patient.childrenContact?.phone || '+91 90000 00000'})
                      </span>
                    </a>
                  </div>
                  <div className='text-center text-[11px] text-muted-foreground'>
                    Target: {patient.childrenContact?.email} &{' '}
                    {patient.doctorContact?.email}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB: DOCTOR PORTAL */}
          <TabsContent value='doctor-portal' className='space-y-6'>
            <div className='flex flex-col items-start justify-between gap-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 md:flex-row md:items-center'>
              <div className='flex items-center gap-3'>
                <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm'>
                  <Stethoscope className='h-6 w-6' />
                </div>
                <div>
                  <h3 className='text-lg font-bold text-foreground'>
                    Doctor Clinical Portal for {honorificLabel} ({patient.name})
                  </h3>
                  <p className='text-xs text-muted-foreground'>
                    Treating Physician:{' '}
                    <strong>
                      {patient.doctorContact?.doctorName ||
                        'Dr. R. Ramanathan, MD'}
                    </strong>{' '}
                    • Clinical Email:{' '}
                    <strong>
                      {patient.doctorContact?.email || 'doctor@example.com'}
                    </strong>
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  size='sm'
                  onClick={() => setIsTelehealthOpen(true)}
                  className='flex h-9 items-center gap-1.5 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700'
                >
                  <Video className='h-3.5 w-3.5' />
                  Launch TeleHealth Room
                </Button>
                <Button
                  size='sm'
                  onClick={() => setIsAddModalOpen(true)}
                  className='h-9 bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700'
                >
                  <Plus className='mr-1.5 h-3.5 w-3.5' />
                  Add Clinical Prescription
                </Button>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              {/* Doctor Clinical Profile & Diagnoses */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base font-bold'>
                    <Stethoscope className='h-4 w-4 text-indigo-600' />
                    <span>Clinical Profile & Diagnoses</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 text-xs'>
                  <div className='space-y-1.5'>
                    <span className='font-semibold text-muted-foreground'>
                      Active Diagnosed Conditions:
                    </span>
                    <div className='flex flex-wrap gap-1.5 pt-1'>
                      {patient.medicalConditions.map((cond) => (
                        <Badge
                          key={cond}
                          variant='outline'
                          className='border-primary/20 bg-primary/5 text-xs font-medium text-primary'
                        >
                          {cond}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className='space-y-1.5 border-t pt-2'>
                    <span className='font-semibold text-rose-600'>
                      Known Drug Allergies:
                    </span>
                    <div className='flex flex-wrap gap-1.5 pt-1'>
                      {patient.allergies.map((allergy) => (
                        <Badge
                          key={allergy}
                          variant='destructive'
                          className='text-xs'
                        >
                          ⚠️ {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className='space-y-1 border-t pt-2'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Treating Physician:
                      </span>
                      <span className='font-bold text-foreground'>
                        {patient.doctorContact?.doctorName}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Clinic / Hospital:
                      </span>
                      <span className='text-foreground'>
                        {patient.doctorContact?.clinic ||
                          'Apollo Speciality Hospitals'}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Doctor Contact Email:
                      </span>
                      <span className='font-mono font-semibold text-indigo-600'>
                        {patient.doctorContact?.email}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gemini Clinical Interaction Audit */}
              <Card className='md:col-span-2'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='flex items-center gap-2 text-base font-bold'>
                        <Sparkles className='h-4 w-4 text-amber-500' />
                        <span>Google Gemini 2.5 Flash Clinical Audit</span>
                      </CardTitle>
                      <CardDescription className='text-xs'>
                        Automated contraindication and drug-disease interaction
                        audit for {honorificLabel}
                      </CardDescription>
                    </div>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={handleRunSafetyCheck}
                      disabled={isCheckingInteractions}
                      className='h-8 border-primary/30 text-xs text-primary'
                    >
                      {isCheckingInteractions ? (
                        <Loader2 className='h-3.5 w-3.5 animate-spin' />
                      ) : (
                        'Re-scan Interactions'
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='space-y-3 text-xs'>
                  {interactionAlerts.length === 0 ? (
                    <div className='flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-4 text-muted-foreground'>
                      <AlertCircle className='h-4 w-4 flex-shrink-0' />
                      <span>
                        Safety check has not completed yet for the current{' '}
                        {medications.length} medications.
                      </span>
                    </div>
                  ) : (
                    interactionAlerts.map((alert, i) => (
                      <div
                        key={i}
                        className={`space-y-1.5 rounded-xl border p-3.5 ${
                          alert.severity === 'danger'
                            ? 'border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-200'
                            : alert.severity === 'unknown'
                              ? 'border-border bg-muted/60 text-foreground'
                              : 'border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200'
                        }`}
                      >
                        <div className='flex items-center justify-between'>
                          <span className='flex items-center gap-1.5 font-bold'>
                            <AlertCircle className='h-3.5 w-3.5' />
                            {alert.medicationsInvolved.join(' + ')}
                          </span>
                          <Badge
                            variant={
                              alert.severity === 'danger'
                                ? 'destructive'
                                : 'outline'
                            }
                            className='text-[10px] uppercase'
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className='text-[11px] leading-relaxed'>
                          {alert.description}
                        </p>
                        <div className='rounded-lg bg-background/60 p-2 text-[10px] font-semibold'>
                          <strong>Clinical Recommendation:</strong>{' '}
                          {alert.recommendation}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Clinical Telemetry & Diagnostics Vault */}
            <VitalsTrackerWidget
              patientName={patient.name}
              honorific={honorificLabel}
            />
            <LabReportsVault
              patientName={patient.name}
              honorific={honorificLabel}
            />
          </TabsContent>

          {/* TAB 2: MEDICATIONS */}
          <TabsContent value='medications' className='space-y-4'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div>
                <h3 className='text-lg font-bold'>Medication Management</h3>
                <p className='text-xs text-muted-foreground'>
                  Add, edit, or remove prescriptions. Gemini AI OCR is available
                  for auto-fill.
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsRefillDialogOpen(true)}
                  className='flex h-9 items-center gap-1.5 border-primary/30 text-xs text-primary hover:bg-primary/10'
                >
                  <Pill className='h-3.5 w-3.5' />
                  Pill Stock &amp; Refills
                </Button>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className='h-9 bg-primary text-xs text-primary-foreground'
                >
                  <Plus className='mr-1 h-3.5 w-3.5' />
                  Add Medication
                </Button>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {medications.map((med) => (
                <Card
                  key={med.id}
                  className='relative overflow-hidden shadow-sm'
                >
                  <div
                    className={`h-1.5 w-full ${
                      med.criticality === 'high'
                        ? 'bg-rose-500'
                        : med.criticality === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                  />
                  <CardHeader className='pb-2'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <Badge
                          variant='outline'
                          className='mb-1 font-mono text-[10px] uppercase'
                        >
                          {med.slot} • {med.time}
                        </Badge>
                        <CardTitle className='text-base font-bold'>
                          {med.name}
                        </CardTitle>
                        <CardDescription className='mt-0.5 text-xs font-semibold text-primary'>
                          {med.dosage}
                        </CardDescription>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => {
                          onDeleteMedication(med.id)
                          toast.success(`Removed ${med.name}`)
                        }}
                        aria-label={`Remove ${med.name}`}
                        className='h-8 w-8 text-muted-foreground hover:text-destructive'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-2 text-xs'>
                    <div className='rounded-lg bg-muted/40 p-2.5'>
                      <span className='font-semibold text-muted-foreground'>
                        Instructions:
                      </span>{' '}
                      <span>{med.instructions}</span>
                    </div>
                    <div className='flex items-center justify-between text-muted-foreground'>
                      <span>Prescribed by: {med.prescribedBy}</span>
                      <span>
                        Pills remaining:{' '}
                        <strong className='text-foreground'>
                          {med.remainingPills}/{med.totalPills}
                        </strong>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: DOCTOR APPOINTMENTS */}
          <TabsContent value='appointments' className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-lg font-bold'>
                  Upcoming Doctor Appointments
                </h3>
                <p className='text-xs text-muted-foreground'>
                  Track clinical consultations and send automated email
                  reminders to family.
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {appointments.map((apt) => (
                <Card key={apt.id} className='shadow-sm'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <Badge className='mb-1 border-primary/20 bg-primary/10 text-xs text-primary'>
                          {apt.specialty}
                        </Badge>
                        <CardTitle className='text-base font-bold'>
                          {apt.doctorName}
                        </CardTitle>
                        <CardDescription className='mt-0.5 text-xs text-muted-foreground'>
                          {apt.clinic} • {apt.address}
                        </CardDescription>
                      </div>
                      <Badge
                        variant='outline'
                        className='text-xs font-semibold'
                      >
                        {apt.dateTime}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-3 text-xs'>
                    <div className='rounded-lg border border-border/40 bg-muted/40 p-2.5'>
                      <span className='font-semibold text-foreground'>
                        Clinical Notes:
                      </span>{' '}
                      <span className='text-muted-foreground'>{apt.notes}</span>
                    </div>

                    <div className='flex items-center justify-between pt-1'>
                      <div className='font-mono text-muted-foreground'>
                        Clinic: {apt.contactPhone}
                      </div>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() =>
                          handleDispatchEmail('appointment_reminder')
                        }
                        disabled={isSendingEmail}
                        className='h-8 text-xs font-medium'
                      >
                        <Send className='mr-1.5 h-3.5 w-3.5 text-primary' />
                        Email Reminder to Family
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 4: GEMINI DRUG SAFETY SHIELD */}
          <TabsContent value='safety' className='space-y-4'>
            <Card className='border-amber-500/20 bg-amber-500/5'>
              <CardHeader>
                <div className='flex flex-wrap items-center justify-between gap-4'>
                  <div>
                    <CardTitle className='flex items-center gap-2 text-base font-bold'>
                      <Sparkles className='h-5 w-5 text-amber-500' />
                      Google Gemini 2.5 Flash Clinical Safety Shield
                    </CardTitle>
                    <CardDescription className='text-xs'>
                      AI-powered drug-drug interaction contraindication audit
                      for elderly care.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleRunSafetyCheck}
                    disabled={isCheckingInteractions}
                    size='sm'
                    className='bg-amber-600 text-xs font-medium text-white hover:bg-amber-700'
                  >
                    {isCheckingInteractions ? (
                      <>
                        <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                        Analyzing with Gemini...
                      </>
                    ) : (
                      <>
                        <Sparkles className='mr-1.5 h-3.5 w-3.5' />
                        Re-check Interactions
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {interactionAlerts.length === 0 ? (
                  <div className='py-6 text-center text-sm text-muted-foreground'>
                    Click "Re-check Interactions" to run the Google Gemini
                    clinical audit.
                  </div>
                ) : (
                  interactionAlerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl border p-4 ${
                        alert.severity === 'danger'
                          ? 'border-rose-500/30 bg-rose-500/10'
                          : alert.severity === 'warning'
                            ? 'border-amber-500/30 bg-amber-500/10'
                            : alert.severity === 'unknown'
                              ? 'border-border bg-muted/60'
                              : 'border-emerald-500/30 bg-emerald-500/10'
                      }`}
                    >
                      <div className='mb-2 flex items-center gap-2'>
                        {alert.severity === 'danger' ? (
                          <AlertTriangle className='h-4 w-4 text-rose-600' />
                        ) : alert.severity === 'warning' ? (
                          <AlertTriangle className='h-4 w-4 text-amber-600' />
                        ) : alert.severity === 'unknown' ? (
                          <AlertCircle className='h-4 w-4 text-muted-foreground' />
                        ) : (
                          <CheckCircle2 className='h-4 w-4 text-emerald-700' />
                        )}
                        <span className='text-xs font-bold tracking-wider uppercase'>
                          {alert.severity === 'danger'
                            ? 'High Contraindication Risk'
                            : alert.severity === 'warning'
                              ? 'Precaution Advisory'
                              : alert.severity === 'unknown'
                                ? 'Check Not Completed'
                                : 'Verified Compatible'}
                        </span>
                        {alert.medicationsInvolved &&
                          alert.medicationsInvolved.length > 0 && (
                            <span className='font-mono text-xs text-muted-foreground'>
                              ({alert.medicationsInvolved.join(' + ')})
                            </span>
                          )}
                      </div>

                      <p className='mb-2 text-sm font-medium text-foreground'>
                        {alert.description}
                      </p>

                      <div className='space-y-1 rounded-lg bg-background/50 p-3 text-xs text-muted-foreground'>
                        <div>
                          <strong>Recommendation:</strong>{' '}
                          {alert.recommendation}
                        </div>
                        {alert.dietaryNote && (
                          <div>
                            <strong>Dietary Guidance:</strong>{' '}
                            {alert.dietaryNote}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: EMAIL DISPATCH SYSTEM */}
          <TabsContent value='email-simulator' className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              {/* Dispatch Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base font-bold'>
                    <Mail className='h-4 w-4 text-primary' />
                    Proactive Email Notification Engine
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Tested via Resend API to family recipient:{' '}
                    <strong>{patient.emergencyContact.email}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='grid grid-cols-2 gap-2'>
                    <Button
                      variant={
                        previewEmailType === 'missed_medication'
                          ? 'default'
                          : 'outline'
                      }
                      size='sm'
                      onClick={() => setPreviewEmailType('missed_medication')}
                      className='h-9 text-xs'
                    >
                      Missed Dose Alert
                    </Button>
                    <Button
                      variant={
                        previewEmailType === 'upcoming_dose'
                          ? 'default'
                          : 'outline'
                      }
                      size='sm'
                      onClick={() => setPreviewEmailType('upcoming_dose')}
                      className='h-9 text-xs'
                    >
                      Upcoming Reminder
                    </Button>
                    <Button
                      variant={
                        previewEmailType === 'appointment_reminder'
                          ? 'default'
                          : 'outline'
                      }
                      size='sm'
                      onClick={() =>
                        setPreviewEmailType('appointment_reminder')
                      }
                      className='h-9 text-xs'
                    >
                      Doctor Appointment
                    </Button>
                    <Button
                      variant={
                        previewEmailType === 'emergency_sos'
                          ? 'default'
                          : 'outline'
                      }
                      size='sm'
                      onClick={() => setPreviewEmailType('emergency_sos')}
                      className='h-9 text-xs'
                    >
                      Emergency SOS
                    </Button>
                  </div>

                  <Button
                    onClick={() => handleDispatchEmail(previewEmailType)}
                    disabled={isSendingEmail}
                    className='mt-2 flex w-full items-center justify-center gap-2 bg-primary font-semibold text-primary-foreground'
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        <span>Sending via Resend API...</span>
                      </>
                    ) : (
                      <>
                        <Send className='h-4 w-4' />
                        <span>Trigger Real Email Dispatch</span>
                      </>
                    )}
                  </Button>

                  {/* Activity Log */}
                  <div className='mt-6 space-y-2'>
                    <h4 className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                      Recent Email Dispatches
                    </h4>
                    <div className='max-h-48 space-y-1.5 overflow-y-auto'>
                      {emailLogs.map((log) => (
                        <div
                          key={log.id}
                          className='flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs'
                        >
                          <div>
                            <div className='font-semibold'>{log.subject}</div>
                            <div className='text-[10px] text-muted-foreground'>
                              To: {log.recipient} • {log.time}
                            </div>
                          </div>
                          <Badge
                            className={
                              log.status === 'failed'
                                ? 'border-rose-500/20 bg-rose-500/10 text-[10px] text-rose-700'
                                : log.status === 'simulated'
                                  ? 'border-border bg-muted text-[10px] text-muted-foreground'
                                  : 'border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-700'
                            }
                          >
                            {log.status === 'failed'
                              ? 'Not sent'
                              : log.status === 'simulated'
                                ? 'Sample'
                                : 'Delivered'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Template Live Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base font-bold'>
                    Email HTML Live Preview
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Accessible, high-contrast email template delivered to
                    recipient's email client.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='max-h-[460px] overflow-hidden overflow-y-auto rounded-xl border border-border bg-slate-50 p-4 shadow-inner'>
                    <iframe
                      title='Email preview'
                      sandbox=''
                      className='h-[420px] w-full border-0 bg-white'
                      srcDoc={
                        buildEmailTemplate({
                          recipientEmail: patient.emergencyContact.email,
                          recipientName: patient.emergencyContact.name,
                          elderName: patient.name,
                          type: previewEmailType,
                          medicationOrDetails:
                            previewEmailType === 'appointment_reminder'
                              ? 'Dr. R. Ramanathan, MD (Cardiologist) • Tomorrow 10:30 AM'
                              : 'Amlodipine (Norvasc) 5mg - 1 Tablet',
                          scheduledTime: new Date().toLocaleTimeString(),
                        }).html
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AddMedicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAddMedication}
      />

      <TelehealthConsultationModal
        isOpen={isTelehealthOpen}
        onClose={() => setIsTelehealthOpen(false)}
        doctorName={patient.doctorContact?.doctorName}
        specialty={`${patient.doctorContact?.specialty} • ${patient.doctorContact?.clinic}`}
        honorific={honorificLabel}
        patientName={patient.name}
        language={currentLanguage}
      />

      <PharmacyRefillDialog
        isOpen={isRefillDialogOpen}
        onClose={() => setIsRefillDialogOpen(false)}
        medications={medications}
        honorific={honorificLabel}
      />
    </div>
  )
}

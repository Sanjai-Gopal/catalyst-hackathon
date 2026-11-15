import { useState } from 'react'
import { INITIAL_LAB_REPORTS } from '@/data/carenestInitialData'
import { type LabReportRecord } from '@/types/carenest'
import {
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  Building,
  Printer,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

interface LabReportsVaultProps {
  honorific?: string
  patientName?: string
}

export function LabReportsVault({
  honorific = 'Amma',
  patientName = 'Lakshmi Narayanan',
}: LabReportsVaultProps) {
  const [reports] = useState<LabReportRecord[]>(INITIAL_LAB_REPORTS)

  const handleDownload = (report: LabReportRecord) => {
    toast.success(`Exporting verified clinical PDF for ${report.testName}...`)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Card className='border-border/60 shadow-sm'>
      <CardHeader className='pb-3'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <div className='flex items-center gap-2'>
              <CardTitle className='flex items-center gap-2 text-base font-bold'>
                <FileText className='h-4 w-4 text-primary' />
                Digital Health Vault &amp; Diagnostics
              </CardTitle>
              <Badge
                variant='outline'
                className='border-primary/20 bg-primary/10 text-[10px] text-primary'
              >
                {reports.length} Verified Records
              </Badge>
            </div>
            <CardDescription className='mt-0.5 text-xs'>
              Biochemical lab investigations, ECGs, and hospital discharge
              summaries for {honorific} ({patientName}).
            </CardDescription>
          </div>

          <Button
            size='sm'
            variant='outline'
            onClick={handlePrint}
            className='h-8 gap-1.5 text-xs font-semibold'
          >
            <Printer className='h-3.5 w-3.5' />
            Print Vault Summary
          </Button>
        </div>
      </CardHeader>

      <CardContent className='space-y-3'>
        {reports.map((report) => (
          <div
            key={report.id}
            className='flex flex-col justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5 transition-all hover:bg-muted/40 md:flex-row md:items-center'
          >
            <div className='flex-1 space-y-1.5'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-sm font-bold text-foreground'>
                  {report.testName}
                </span>
                <Badge variant='secondary' className='font-mono text-[10px]'>
                  {report.category}
                </Badge>
                {report.doctorReviewed && (
                  <Badge
                    variant='outline'
                    className='flex items-center gap-1 border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-600'
                  >
                    <CheckCircle2 className='h-3 w-3' />
                    Physician Signed
                  </Badge>
                )}
              </div>

              <p className='text-xs text-muted-foreground'>
                {report.keyFinding}
              </p>

              <div className='flex flex-wrap items-center gap-4 pt-0.5 text-[11px] text-muted-foreground'>
                <span className='flex items-center gap-1'>
                  <Calendar className='h-3 w-3' />
                  {report.date}
                </span>
                <span className='flex items-center gap-1'>
                  <Building className='h-3 w-3' />
                  {report.diagnosticCenter}
                </span>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleDownload(report)}
                className='h-8 gap-1.5 text-xs font-semibold'
              >
                <Download className='h-3.5 w-3.5' />
                Export PDF
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

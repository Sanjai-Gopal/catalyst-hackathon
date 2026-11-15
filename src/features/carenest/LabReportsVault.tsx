import { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  Building,
  Printer,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LabReportRecord } from '@/types/carenest';
import { INITIAL_LAB_REPORTS } from '@/data/carenestInitialData';

interface LabReportsVaultProps {
  honorific?: string;
  patientName?: string;
}

export function LabReportsVault({
  honorific = 'Amma',
  patientName = 'Lakshmi Narayanan',
}: LabReportsVaultProps) {
  const [reports] = useState<LabReportRecord[]>(INITIAL_LAB_REPORTS);

  const handleDownload = (report: LabReportRecord) => {
    toast.success(`Exporting verified clinical PDF for ${report.testName}...`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className='border-border/60 shadow-sm'>
      <CardHeader className='pb-3'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <div className='flex items-center gap-2'>
              <CardTitle className='text-base font-bold flex items-center gap-2'>
                <FileText className='w-4 h-4 text-primary' />
                Digital Health Vault &amp; Diagnostics
              </CardTitle>
              <Badge variant='outline' className='text-[10px] bg-primary/10 text-primary border-primary/20'>
                {reports.length} Verified Records
              </Badge>
            </div>
            <CardDescription className='text-xs mt-0.5'>
              Biochemical lab investigations, ECGs, and hospital discharge summaries for {honorific} ({patientName}).
            </CardDescription>
          </div>

          <Button
            size='sm'
            variant='outline'
            onClick={handlePrint}
            className='h-8 text-xs font-semibold gap-1.5'
          >
            <Printer className='w-3.5 h-3.5' />
            Print Vault Summary
          </Button>
        </div>
      </CardHeader>

      <CardContent className='space-y-3'>
        {reports.map((report) => (
          <div
            key={report.id}
            className='p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3'
          >
            <div className='space-y-1.5 flex-1'>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className='font-bold text-sm text-foreground'>{report.testName}</span>
                <Badge variant='secondary' className='text-[10px] font-mono'>
                  {report.category}
                </Badge>
                {report.doctorReviewed && (
                  <Badge variant='outline' className='text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 flex items-center gap-1'>
                    <CheckCircle2 className='w-3 h-3' />
                    Physician Signed
                  </Badge>
                )}
              </div>

              <p className='text-xs text-muted-foreground'>
                {report.keyFinding}
              </p>

              <div className='flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap pt-0.5'>
                <span className='flex items-center gap-1'>
                  <Calendar className='w-3 h-3' />
                  {report.date}
                </span>
                <span className='flex items-center gap-1'>
                  <Building className='w-3 h-3' />
                  {report.diagnosticCenter}
                </span>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleDownload(report)}
                className='h-8 text-xs font-semibold gap-1.5'
              >
                <Download className='w-3.5 h-3.5' />
                Export PDF
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

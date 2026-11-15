import { Heart } from 'lucide-react'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='container grid min-h-svh max-w-none items-center justify-center bg-[#FBF9F5] dark:bg-background'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-3 py-8 sm:p-8'>
        <div className='mb-2 flex flex-col items-center justify-center text-center'>
          <div className='mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md'>
            <Heart className='h-6 w-6' />
          </div>
          <h1 className='font-serif text-2xl font-bold tracking-tight text-foreground'>
            CareNest AI
          </h1>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            Intelligent Elderly Care & Medication Management Platform
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}

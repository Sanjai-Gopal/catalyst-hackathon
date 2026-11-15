import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  // Vercel serverless functions are entry points that nothing imports.
  entry: ['api/**/*.ts'],
  ignore: ['src/components/ui/**', 'src/components/layout/app-title.tsx'],
}

export default config

import { notFound } from 'next/navigation'

/**
 * The /lab playground is a development-only showcase of the motion kit. In a
 * production build every /lab route 404s, so a deployed client site never
 * exposes it — and the ~1000-line registry that only /lab imports stays out of
 * the served app. Browse it locally with `pnpm dev`.
 */
export default function LabLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'production') notFound()
  return <>{children}</>
}

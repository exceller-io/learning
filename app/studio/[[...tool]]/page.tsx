import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { StudioWrapper } from './studio-wrapper'

export const dynamic = 'force-dynamic'

export default async function StudioPage() {
  const session = await auth()
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'AUTHOR')) {
    redirect('/login')
  }
  return <StudioWrapper />
}

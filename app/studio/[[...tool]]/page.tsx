import { redirect } from 'next/navigation'
import { NextStudio } from 'next-sanity/studio'
import { auth } from '@/lib/auth'
import config from '@/sanity.config'

export const dynamic = 'force-dynamic'

export default async function StudioPage() {
  const session = await auth()
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR')) {
    redirect('/login')
  }
  return <NextStudio config={config} />
}

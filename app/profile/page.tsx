import AppShell from '@/components/ui/AppShell'
import ProfileClient from '../../components/profile/ProfileClient'

export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileClient />
    </AppShell>
  )
}

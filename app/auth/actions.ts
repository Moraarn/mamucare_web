'use server'

import { cookies } from 'next/headers'

export async function logout() {
  const cookieStore = cookies()

  // Clear all auth cookies
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  cookieStore.delete('MamuCare_token')
  cookieStore.delete('nab_MamuCare_token')

  return { success: true }
}

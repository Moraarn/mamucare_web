'use server'

import { cookies } from 'next/headers'

export async function logout() {
  const cookieStore = cookies()

  // Clear all auth cookies
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  cookieStore.delete('CystaNiva_token')
  cookieStore.delete('nab_CystaNiva_token')

  return { success: true }
}

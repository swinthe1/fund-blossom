import { supabase } from '@/integrations/supabase/client'

export interface SendTransactionalEmailArgs {
  templateName: string
  recipientEmail: string
  idempotencyKey: string
  templateData?: Record<string, unknown>
}

export async function sendTransactionalEmail(args: SendTransactionalEmailArgs): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) throw new Error('Not authenticated')

  const res = await fetch('/lovable/email/transactional/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(args),
  })

  if (!res.ok) {
    let detail = ''
    try {
      const j = await res.json()
      detail = j?.error || JSON.stringify(j)
    } catch {
      detail = await res.text().catch(() => '')
    }
    throw new Error(`Email send failed (${res.status}): ${detail}`)
  }
}

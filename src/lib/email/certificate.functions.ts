import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { evaluatePass } from '@/lib/exam/thresholds'

export const sendCertificateEmail = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ certificateId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    // RLS: only admins can read certificates, so this doubles as the access check.
    const { data: c, error } = await context.supabase
      .from('certificates').select('*').eq('id', data.certificateId).maybeSingle()
    if (error || !c) throw new Error('Zertifikat nicht gefunden oder keine Berechtigung')
    if (!c.email) throw new Error('Keine E-Mail-Adresse hinterlegt')
    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email')
    const result = await sendTemplateEmail('certificate-delivery', c.email, {
      templateData: {
        firstName: c.first_name, lastName: c.last_name, examDate: c.exam_date, examLevel: c.exam_level,
        certificateNumber: c.certificate_number,
        passed: evaluatePass(c.exam_level, {
          pointsHoerenLesen: c.points_hoeren_lesen, pointsSchreiben: c.points_schreiben,
          pointsSprechen: c.points_sprechen, pointsWerte: c.points_werte,
        }).passed,
      },
      idempotencyKey: `cert-delivery-${c.id}-${(c.email_send_count ?? 0) + 1}`,
    })
    if (!result.sent) throw new Error('Empfänger hat E-Mails abbestellt oder ist gesperrt')
    return { ok: true }
  })

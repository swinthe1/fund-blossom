import { sendCertificateEmail } from './certificate.functions'

export interface SendTransactionalEmailArgs {
  templateName: string
  recipientEmail: string
  idempotencyKey: string
  templateData?: Record<string, unknown>
  certificateId?: string
}

// Admin UI entry point: the server loads the certificate itself and sends to its stored address.
export async function sendTransactionalEmail(args: SendTransactionalEmailArgs): Promise<void> {
  if (!args.certificateId) throw new Error('certificateId fehlt')
  await sendCertificateEmail({ data: { certificateId: args.certificateId } })
}

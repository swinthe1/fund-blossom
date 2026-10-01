import React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  firstName?: string
  lastName?: string
  examDate?: string
  examLevel?: string
  passed?: boolean
  certificateNumber?: string
}

const Email = ({ firstName, lastName, examDate, examLevel, passed, certificateNumber }: Props) => {
  const name = [firstName, lastName].filter(Boolean).join(' ')
  const url = certificateNumber ? `https://integrationsfondos.at/verify/${encodeURIComponent(certificateNumber)}` : 'https://integrationsfondos.at/verify'
  return (
    <Html lang="de" dir="ltr">
      <Head />
      <Preview>Ihr Prüfungsergebnis beim Österreichischen Integrationsfonds</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>Österreichischer Integrationsfonds</Text>
          <Heading style={h1}>Ihr Prüfungsergebnis</Heading>
          <Text style={text}>{name ? `Sehr geehrte/r ${name},` : 'Sehr geehrte Damen und Herren,'}</Text>
          <Text style={text}>
            Ihr Zertifikat zur Integrationsprüfung{examLevel ? ` (${examLevel})` : ''}{examDate ? ` vom ${examDate}` : ''} ist jetzt online verfügbar.
            {typeof passed === 'boolean' ? (passed ? ' Sie haben die Prüfung bestanden.' : ' Die Prüfung wurde leider nicht bestanden.') : ''}
          </Text>
          {certificateNumber && <Text style={text}>Zertifikatsnummer: <b>{certificateNumber}</b></Text>}
          <Section style={{ margin: '28px 0' }}>
            <Button href={url} style={button}>Zertifikat ansehen</Button>
          </Section>
          <Hr style={{ borderColor: '#e5e5e5' }} />
          <Text style={small}>Österreichischer Integrationsfonds · integrationsfondos.at</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: 'Ihr Zertifikat zur Integrationsprüfung',
  displayName: 'Zertifikat-Zustellung',
  previewData: { firstName: 'Anna', lastName: 'Muster', examDate: '01.10.2026', examLevel: 'B1', passed: true, certificateNumber: 'INTA2-52107699' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const brand = { color: '#c8102e', fontWeight: 700, fontSize: '14px', margin: 0 }
const h1 = { fontSize: '22px', color: '#1a1a1a', margin: '16px 0' }
const text = { fontSize: '15px', color: '#333333', lineHeight: '1.6' }
const small = { fontSize: '12px', color: '#888888' }
const button = { backgroundColor: '#c8102e', color: '#ffffff', padding: '12px 22px', borderRadius: '999px', fontWeight: 600, textDecoration: 'none' }

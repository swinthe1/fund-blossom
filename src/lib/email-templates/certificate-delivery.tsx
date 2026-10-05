import React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface ModuleResult {
  label: string
  points?: number | string | null
  passed?: boolean
}

interface Props {
  firstName?: string
  lastName?: string
  examDate?: string
  examLevel?: string
  passed?: boolean
  certificateNumber?: string
  modules?: ModuleResult[]
}

const Email = ({ firstName, lastName, examDate, examLevel, passed, certificateNumber, modules }: Props) => {
  const name = [firstName, lastName].filter(Boolean).join(' ')
  const url = certificateNumber ? `https://integrationsfondos.at/verify/${encodeURIComponent(certificateNumber)}` : 'https://integrationsfondos.at/verify'
  const list = (modules ?? []).filter((m) => m.points !== null && m.points !== undefined && m.points !== '')

  return (
    <Html lang="de" dir="ltr">
      <Head />
      <Preview>Ihr Prüfungsergebnis beim Österreichischen Integrationsfonds</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://bh-botschaft.at/wp-content/uploads/2020/04/OEIF_Logo.png"
            alt="Österreichischer Integrationsfonds"
            width="180"
            style={logo}
          />
          <Text style={brand}>Österreichischer Integrationsfonds</Text>
          <Heading style={h1}>Prüfungsergebnis / Integrationsprüfung{examLevel ? ` ${examLevel}` : ''}</Heading>
          <Text style={text}>{name ? `Sehr geehrte/r Herr/Frau ${name},` : 'Sehr geehrte Damen und Herren,'}</Text>
          <Text style={text}>
            Sie haben{examDate ? ` am ${examDate}` : ''} an einer Integrationsprüfung{examLevel ? ` ${examLevel}` : ''} teilgenommen.
          </Text>
          {typeof passed === 'boolean' && (
            <Text style={text}>
              {passed
                ? 'Hiermit teilen wir Ihnen mit, dass Sie die Prüfung bestanden haben.'
                : 'Hiermit teilen wir Ihnen mit, dass Sie die Prüfung leider nicht bestanden haben.'}
            </Text>
          )}
          {list.length > 0 && (
            <>
              <Text style={{ ...text, fontWeight: 700, marginBottom: 4 }}>Ihr Detailergebnis:</Text>
              {list.map((m) => (
                <Text key={m.label} style={{ ...text, margin: '2px 0' }}>
                  • {m.label}: {m.points}{typeof m.passed === 'boolean' ? ` - ${m.passed ? 'Bestanden' : 'Nicht bestanden'}` : ''}
                </Text>
              ))}
            </>
          )}
          <Text style={text}>
            Wir möchten Sie darauf hinweisen, dass Sie im Rahmen der Integrationsvereinbarung die Integrationsprüfung beliebig oft wiederholen können. Eine Wiederholung einzelner Prüfungsteile ist jedoch nicht zulässig.
          </Text>
          {certificateNumber && <Text style={text}>Zertifikatsnummer: <b>{certificateNumber}</b></Text>}
          <Section style={{ margin: '24px 0' }}>
            <Button href={url} style={button}>Zertifikat ansehen</Button>
          </Section>
          <Text style={text}>Mit freundlichen Grüßen,<br />Ihr Team des Österreichischen Integrationsfonds (ÖIF)</Text>
          <Hr style={{ borderColor: '#e5e5e5' }} />
          <Text style={small}>Österreichischer Integrationsfonds · integrationsfondos.at</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: 'Prüfungsergebnis / Integrationsprüfung',
  displayName: 'Zertifikat-Zustellung',
  previewData: {
    firstName: 'Max', lastName: 'Mustermann', examDate: '01.10.2026', examLevel: 'B1', passed: true, certificateNumber: 'INTA2-52107699',
    modules: [
      { label: 'Modul Hören/Lesen', points: 45, passed: true },
      { label: 'Modul Schreiben', points: 20, passed: true },
      { label: 'Modul Sprechen', points: 85, passed: true },
      { label: 'Modul Werte- und Orientierungswissen', points: 30, passed: true },
    ],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, 
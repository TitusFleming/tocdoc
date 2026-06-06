'use server'

import { Resend } from 'resend'
import prisma from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

type EventType = 'ADMISSION' | 'DISCHARGE'

export async function sendEventNotification(
  doctorEmail: string,
  type: EventType,
  doctorId?: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email notification')
    return
  }

  const isAdmission = type === 'ADMISSION'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tocdoctor.com'
  const loginUrl = `${appUrl}/sign-in`

  const subject = isAdmission
    ? 'New patient admission — TOCdoctor.com'
    : 'Patient discharge notification — TOCdoctor.com'

  const body = isAdmission
    ? 'You have a new patient admission assigned to you. Log in to TOCdoctor.com to view details.'
    : 'A patient has been discharged. Log in to TOCdoctor.com to view your discharge history.'

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0369a1;">${isAdmission ? 'New Patient Admission' : 'Patient Discharge'}</h2>
      <p>${body}</p>
      <div style="margin: 20px 0;">
        <a href="${loginUrl}" style="background-color: #0369a1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Dashboard</a>
      </div>
      <p style="color: #666; font-size: 12px;">This is an automated notification from TOCdoctor.com. No patient information is included for HIPAA compliance.</p>
    </div>
  `

  const recipients = [doctorEmail]

  if (doctorId) {
    try {
      const ccList = await prisma.ccRecipient.findMany({
        where: { doctorId },
        include: { user: { select: { email: true } } },
      })
      for (const cc of ccList) {
        if (cc.user.email && !recipients.includes(cc.user.email)) {
          recipients.push(cc.user.email)
        }
      }
    } catch (error) {
      console.error('Error fetching CC recipients:', error)
    }
  }

  try {
    const result = await resend.emails.send({
      from: 'TOCdoctor.com <notifications@tocdoctor.com>',
      to: recipients,
      subject,
      html,
    })
    console.log(`Email sent (${type}) to ${recipients.join(', ')}:`, result)
  } catch (error) {
    console.error('Failed to send email notification:', error)
  }
}

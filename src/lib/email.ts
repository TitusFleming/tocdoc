'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type EventType = 'ADMISSION' | 'DISCHARGE'

export async function sendEventNotification(doctorEmail: string, type: EventType) {
  try {
    // Send notifications for both admissions and discharges
    if (type !== 'ADMISSION' && type !== 'DISCHARGE') {
      console.log(`Skipping email for ${type} - only sending for ADMISSION or DISCHARGE`)
      return
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      return
    }

    const isAdmission = type === 'ADMISSION'
    const subject = isAdmission ? `New patient admission in TOCdoctor.com` : `Patient discharge notification from TOCdoctor.com`
    const body = isAdmission 
      ? `You have a new patient admission assigned to you. Log in to TOCdoctor.com to view details and manage the patient.`
      : `You have a patient discharge. Log in to TOCdoctor.com to view your discharge history.`
    const loginUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || 'http://localhost:3000/sign-in'

    const result = await resend.emails.send({
      from: 'TOCdoctor.com <noreply@resend.dev>',
      to: [doctorEmail],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0369a1;">${isAdmission ? 'New Patient Admission' : 'Patient Discharge'}</h2>
          <p>${body}</p>
          <div style="margin: 20px 0;">
            <a href="${loginUrl}" style="background-color: #0369a1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Dashboard</a>
          </div>
          <p style="color: #666; font-size: 12px;">This is an automated notification from TOCdoctor.com. No patient information is included for privacy.</p>
        </div>
      `,
    })

    console.log(`✉️ ${type} notification sent to ${doctorEmail}:`, result)
  } catch (error) {
    console.error('Failed to send email notification:', error)
    throw error
  }
}
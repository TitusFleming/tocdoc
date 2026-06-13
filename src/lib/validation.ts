import { z } from 'zod'

const dateString = z.string().refine(v => !isNaN(Date.parse(v)), {
  message: 'Invalid date',
})

const timeString = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM')
  .optional()
  .nullable()
  .or(z.literal(''))

export const admissionSchema = z.object({
  patientAlias: z.string().trim().min(1).max(100),
  dobMonthYear: z.string().trim().max(7).optional().nullable().or(z.literal('')),
  diagnosis: z.string().trim().min(1).max(5000),
  hospitalName: z.string().trim().min(1).max(200),
  admissionDate: dateString,
  admissionTime: timeString,
  doctorId: z.string().min(1),
  eventType: z.enum(['ADMIT', 'DISCHARGE']).default('ADMIT'),
  dischargeNotes: z.string().max(20000).optional().nullable(),
})

export const dischargeSchema = z.object({
  dischargeDate: dateString,
  dischargeTime: timeString,
  dischargeNotes: z.string().max(20000).optional().nullable(),
})

export const eventUpdateAdminSchema = z.object({
  status: z.enum(['ADMITTED', 'DISCHARGED']).optional(),
  patientAlias: z.string().trim().min(1).max(100).optional(),
  dobMonthYear: z.string().trim().max(7).nullable().optional(),
  diagnosis: z.string().trim().min(1).max(5000).optional(),
  hospitalName: z.string().trim().min(1).max(200).optional(),
  admissionDate: dateString.optional(),
  admissionTime: timeString,
  dischargeDate: dateString.optional(),
  dischargeTime: timeString,
  dischargeNotes: z.string().max(20000).nullable().optional(),
  doctorId: z.string().min(1).optional(),
  reviewed: z.boolean().optional(),
})

export const reviewedOnlySchema = z
  .object({ reviewed: z.boolean() })
  .strict()

export const ccRecipientSchema = z.object({
  doctorId: z.string().min(1),
  userId: z.string().min(1),
})

export const inviteSchema = z.object({
  emailAddress: z.string().trim().email().max(254),
})

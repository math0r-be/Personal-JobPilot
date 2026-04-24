import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
});

export const aiConfigSchema = z.object({
  provider: z.string().optional(),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  model: z.string().optional(),
});

export const smtpConfigSchema = z.object({
  host: z.string().optional(),
  port: z.number().int().positive().optional(),
  secure: z.boolean().optional(),
  user: z.string().optional(),
  pass: z.string().optional(),
  fromName: z.string().optional(),
  fromEmail: z.string().optional(),
});

export const testEmailSchema = z.object({
  testEmail: z.string().min(1),
});

export const createJobSchema = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  rawText: z.string().optional(),
  status: z.enum(['new', 'applied', 'interview', 'offer', 'rejected', 'archived']).optional(),
  url: z.string().optional(),
  source: z.string().optional(),
  salary: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
});

export const createCvSchema = z.object({
  title: z.string().optional(),
  templateId: z.string().optional(),
});

export const createEmailSchema = z.object({
  jobPostingId: z.string().nullable().optional(),
  to: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  status: z.enum(['draft', 'sent', 'error']).optional(),
});

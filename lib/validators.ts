import { z } from 'zod';

export const OpportunityTypeSchema = z.enum([
  'placement',
  'internship',
  'hackathon',
  'scholarship',
  'campus_drive',
  'fellowship',
  'competition',
  'other',
]);

export const EligibilitySchema = z.object({
  branches: z.array(z.string()).nullable(),
  cgpa: z.string().nullable(),
  backlog: z.string().nullable(),
  batch: z.string().nullable(),
  other: z.string().nullable(),
});

export const InterviewProcessSchema = z.object({
  rounds: z.number().nullable(),
  description: z.array(z.string()).nullable(),
});

export const ExtractedOpportunitySchema = z.object({
  company: z.string().nullable(),
  role: z.string().nullable(),
  type: OpportunityTypeSchema.nullable(),
  salary: z.string().nullable(),
  location: z.string().nullable(),
  eligibility: EligibilitySchema.nullable(),
  skills: z.array(z.string()).nullable(),
  responsibilities: z.array(z.string()).nullable(),
  interview_process: InterviewProcessSchema.nullable(),
  instructions: z.string().nullable(),
  apply_link: z.string().nullable(),
  deadline: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  confidence_score: z.number().min(0).max(1),
});

export const OpportunityCreateSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(200),
  role: z.string().min(1, 'Role is required').max(300),
  type: OpportunityTypeSchema,
  salary: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  eligibility: EligibilitySchema.nullable().optional(),
  skills: z.array(z.string()).nullable().optional(),
  responsibilities: z.array(z.string()).nullable().optional(),
  interview_process: InterviewProcessSchema.nullable().optional(),
  instructions: z.string().nullable().optional(),
  apply_link: z.string().url('Must be a valid URL').nullable().optional().or(z.literal('')),
  source_link: z.string().url('Must be a valid URL').nullable().optional().or(z.literal('')),
  raw_text: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
  tags: z.array(z.string()).nullable().optional(),
});

export const ProcessNoticeSchema = z.object({
  rawText: z.string().min(10, 'Notice text must be at least 10 characters').max(50000),
});

export const SearchQuerySchema = z.object({
  q: z.string().max(200).optional(),
  type: OpportunityTypeSchema.optional(),
  location: z.string().max(100).optional(),
  branch: z.string().max(100).optional(),
  sort: z.enum(['latest', 'deadline', 'featured']).default('latest'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type OpportunityCreate = z.infer<typeof OpportunityCreateSchema>;
export type ProcessNoticeInput = z.infer<typeof ProcessNoticeSchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ExtractedOpportunityData = z.infer<typeof ExtractedOpportunitySchema>;

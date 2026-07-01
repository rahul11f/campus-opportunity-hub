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
  branches: z.array(z.string()).nullable().optional(),
  cgpa: z.string().nullable().optional(),
  backlog: z.string().nullable().optional(),
  batch: z.string().nullable().optional(),
  other: z.string().nullable().optional(),
}).catchall(z.any());

export const InterviewProcessSchema = z.object({
  rounds: z
    .union([z.number(), z.string(), z.null()])
    .optional()
    .transform((val) => {
      if (val === null || val === undefined) return null;
      if (typeof val === 'number') return val;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? null : parsed;
    }),
  description: z.array(z.string()).nullable(),
});

export const AdditionalInfoItemSchema = z.object({
  label: z.string(),
  category: z.enum([
    'instructions',
    'contact',
    'logistics',
    'documents',
    'dates',
    'compensation',
    'eligibility',
    'other',
  ]),
  value: z.string(),
});

export const ExtractedOpportunitySchema = z.object({
  basic_information: z.object({
    company_name: z.string().nullable().optional(),
    company_logo: z.string().nullable().optional(),
    opportunity_type: z.string().nullable().optional(),
    round_name: z.string().nullable().optional(),
    verified_status: z.string().nullable().optional(),
    application_deadline: z.string().nullable().optional(),
    jd_link: z.string().nullable().optional(),
  }).nullable().optional(),
  eligibility: z.object({
    educational_qualification: z.string().nullable().optional(),
    eligible_branches: z.string().nullable().optional(),
    eligible_streams: z.string().nullable().optional(),
    passing_batch: z.string().nullable().optional(),
    minimum_cgpa_percentage: z.string().nullable().optional(),
    cutoff_criteria: z.string().nullable().optional(),
    active_backlogs_allowed: z.string().nullable().optional(),
    gender_eligibility: z.string().nullable().optional(),
  }).nullable().optional(),
  job_details: z.object({
    job_role: z.string().nullable().optional(),
    salary_ctc: z.string().nullable().optional(),
    stipend: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    work_mode: z.string().nullable().optional(),
    employment_type: z.string().nullable().optional(),
  }).nullable().optional(),
  recruitment_process: z.object({
    hiring_process: z.string().nullable().optional(),
    number_of_rounds: z.string().nullable().optional(),
    elimination_rounds: z.string().nullable().optional(),
  }).nullable().optional(),
  schedule: z.object({
    event_date: z.string().nullable().optional(),
    time: z.string().nullable().optional(),
    venue: z.string().nullable().optional(),
    mode: z.string().nullable().optional(),
  }).nullable().optional(),
  communication: z.object({
    communication_channel: z.string().nullable().optional(),
    check_inbox: z.string().nullable().optional(),
    check_spam_folder: z.string().nullable().optional(),
    timing_shared_by: z.string().nullable().optional(),
    additional_instructions: z.string().nullable().optional(),
  }).nullable().optional(),
  attachments: z.object({
    jd_link: z.string().nullable().optional(),
    student_eligible_list: z.string().nullable().optional(),
    additional_documents: z.string().nullable().optional(),
  }).nullable().optional(),
  source_metadata: z.object({
    issued_by: z.string().nullable().optional(),
    institution: z.string().nullable().optional(),
    reminder_notice: z.string().nullable().optional(),
    notice_type: z.string().nullable().optional(),
  }).nullable().optional(),
  additional_extracted_info: z.array(AdditionalInfoItemSchema).optional().default([]),
  confidence_score: z.number().min(0).max(1).optional().default(1),
});

export const RootExtractedOpportunitySchema = z.union([
  ExtractedOpportunitySchema,
  z.object({
    opportunities: z.array(ExtractedOpportunitySchema),
  }),
]);

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
  apply_link: z.string().nullable().optional(),
  source_link: z.string().nullable().optional(),
  raw_text: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
  tags: z.array(z.string()).nullable().optional(),
  contribution_id: z.string().uuid().nullable().optional(),
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


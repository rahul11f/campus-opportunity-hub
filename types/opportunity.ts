export type OpportunityType =
  | 'placement'
  | 'internship'
  | 'hackathon'
  | 'scholarship'
  | 'campus_drive'
  | 'fellowship'
  | 'competition'
  | 'other';

export type ModuleKey =
  | 'placement'
  | 'internship'
  | 'academic_notice'
  | 'exam_notice'
  | 'results'
  | 'important_links'
  | 'faculty'
  | 'timetable';

export interface College {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Eligibility {
  branches: string[] | null;
  cgpa: string | null;
  backlog: string | null;
  batch: string | null;
  other: string | null;
}

export interface InterviewProcess {
  rounds: number | null;
  description: string[] | null;
}

export interface Opportunity {
  id: string;
  company: string;
  role: string;
  type: OpportunityType;
  module_key: ModuleKey;
  college_id: string | null;
  source_college_name: string | null;

  salary: string | null;
  location: string | null;

  eligibility: Eligibility | null;

  skills: string[] | null;
  responsibilities: string[] | null;
  interview_process: InterviewProcess | null;

  instructions: string | null;

  apply_link: string | null;
  registration_link: string | null;
  jd_link: string | null;
  source_link: string | null;

  raw_text: string | null;

  deadline: string | null;
  notice_posted_at: string | null;

  featured: boolean;
  is_expired: boolean;
  is_published: boolean;

  retention_days: number;
  archived_at: string | null;

  company_website: string | null;
  company_logo: string | null;
  interview_mode: string | null;
  venue: string | null;
  joining_date: string | null;
  gender_eligibility: string | null;
  education_qualification: string | null;
  streams_specialization: string | null;

  tags: string[] | null;

  views_count: number;

  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface EligibilityCandidate {
  id: string;
  opportunity_id: string;
  college_id: string | null;
  student_name: string | null;
  father_name: string | null;
  university_roll_no: string | null;
  course: string | null;
  branch: string | null;
  batch: string | null;
  backlogs: string | null;
  eligible: boolean;
  raw_row: Record<string, unknown> | null;
  created_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  college_id: string | null;
  full_name: string | null;
  father_name: string | null;
  university_roll_no: string | null;
  branch: string | null;
  batch: string | null;
  cgpa: string | null;
  backlogs: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentContribution {
  id: string;
  user_id: string;
  college_id: string | null;
  contribution_type: string;
  title: string;
  content: string | null;
  source_link: string | null;
  attachment_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  points_awarded: number;
  related_opportunity_id: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface StudentPoints {
  user_id: string;
  total_points: number;
  opportunities_submitted: number;
  corrections_submitted: number;
  approved_contributions: number;
  updated_at: string;
}

export type AdditionalInfoCategory =
  | 'instructions'
  | 'contact'
  | 'logistics'
  | 'documents'
  | 'dates'
  | 'compensation'
  | 'eligibility'
  | 'other';

export interface AdditionalInfoItem {
  label: string;
  category: AdditionalInfoCategory;
  value: string;
}

export interface ExtractedOpportunity {
  company: string | null;
  role: string | null;
  type: OpportunityType | null;
  salary: string | null;
  location: string | null;
  eligibility: Eligibility | null;
  skills: string[] | null;
  responsibilities: string[] | null;
  interview_process: InterviewProcess | null;
  instructions: string | null;
  apply_link: string | null;
  deadline: string | null;
  tags: string[] | null;
  confidence_score: number;
  additional_extracted_info?: AdditionalInfoItem[];
}

export interface DetectedUrl {
  url: string;
  originalUrl: string;
  resolvedUrl: string | null;
  type:
    | 'webpage'
    | 'pdf'
    | 'google_doc'
    | 'google_drive'
    | 'notion'
    | 'linkedin'
    | 'github'
    | 'telegram'
    | 'unknown';
  status:
    | 'pending'
    | 'fetching'
    | 'fetched'
    | 'error'
    | 'login_required';
  content: string | null;
  error: string | null;
}

export interface ProcessingState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  stepName: string;
  status:
    | 'idle'
    | 'processing'
    | 'complete'
    | 'error';
  detectedUrls: DetectedUrl[];
  extractedData: ExtractedOpportunity | null;
  error: string | null;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  opportunity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface FilterOptions {
  type: OpportunityType | '';
  location: string;
  branch: string;
  sort:
    | 'latest'
    | 'deadline'
    | 'featured';
  search: string;
}

export type OpportunityFormData = Omit<
  Opportunity,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'created_by'
  | 'views_count'
  | 'is_expired'
>;
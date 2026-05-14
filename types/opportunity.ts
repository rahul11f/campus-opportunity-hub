export type OpportunityType =
  | 'placement'
  | 'internship'
  | 'hackathon'
  | 'scholarship'
  | 'campus_drive'
  | 'fellowship'
  | 'competition'
  | 'other';

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
  salary: string | null;
  location: string | null;
  eligibility: Eligibility | null;
  skills: string[] | null;
  responsibilities: string[] | null;
  interview_process: InterviewProcess | null;
  instructions: string | null;
  apply_link: string | null;
  source_link: string | null;
  raw_text: string | null;
  deadline: string | null;
  featured: boolean;
  is_expired: boolean;
  is_published: boolean;
  tags: string[] | null;
  views_count: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
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
}

export interface DetectedUrl {
  url: string;
  originalUrl: string;
  resolvedUrl: string | null;
  type: 'webpage' | 'pdf' | 'google_doc' | 'google_drive' | 'notion' | 'linkedin' | 'github' | 'telegram' | 'unknown';
  status: 'pending' | 'fetching' | 'fetched' | 'error' | 'login_required';
  content: string | null;
  error: string | null;
}

export interface ProcessingState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  stepName: string;
  status: 'idle' | 'processing' | 'complete' | 'error';
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
  sort: 'latest' | 'deadline' | 'featured';
  search: string;
}

export type OpportunityFormData = Omit<
  Opportunity,
  'id' | 'created_at' | 'updated_at' | 'created_by' | 'views_count' | 'is_expired'
>;

'use client';

import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  IndianRupee,
  Building2,
  Clock,
  ArrowRight,
  GraduationCap,
  Calendar,
  FileText,
  Paperclip,
  Zap,
  Monitor,
  BookOpen,
  Globe,
  Link as LinkIcon,
  ShieldCheck,
  CheckSquare,
  FileSpreadsheet,
} from 'lucide-react';
import { useEffect, useState } from 'react';

function CountdownTimer({ deadline }: { deadline: string | null }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  useEffect(() => {
    if (!deadline) return;
    
    const calculateTimeLeft = () => {
      const difference = new Date(deadline).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (!deadline) {
    return <span className="text-emerald-600 dark:text-emerald-400 font-medium">Open Always</span>;
  }

  if (!timeLeft) return null;

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0) {
    return <span className="text-red-500 font-medium">Expired</span>;
  }

  const isUrgent = timeLeft.days < 3;

  return (
    <div className={`flex items-center gap-1.5 font-medium ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-muted-foreground'}`}>
      <Clock className="w-4 h-4" />
      <span>
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
        {timeLeft.hours}h left
      </span>
    </div>
  );
}

export function OpportunityCard({ opportunity, onViewDetails }: { opportunity: any; onViewDetails?: () => void }) {
  const isExpired = opportunity.deadline
    ? Math.ceil((new Date(opportunity.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) < 0
    : false;

  // Resolve eligibility, basic info, job details, and other group structures
  const bi = opportunity.basic_information || {};
  const el = opportunity.eligibility || {};
  const jd = opportunity.job_details || {};
  const rp = opportunity.recruitment_process || {};
  const sch = opportunity.schedule || {};
  const comm = opportunity.communication || {};
  const atts = opportunity.attachments || {};

  // Generic helper to search in additional_extracted_info
  const findInAdditionalInfo = (keywords: string[]) => {
    if (!opportunity.additional_extracted_info) return null;
    const match = opportunity.additional_extracted_info.find((item: any) =>
      keywords.some(kw => item.label.toLowerCase().includes(kw.toLowerCase()))
    );
    return match ? match.value : null;
  };

  // Resolve Bond Detail
  let bondVal = el.bond_details || el.bond || null;
  if (!bondVal) {
    bondVal = findInAdditionalInfo(['bond']);
  }

  // Resolve About Company
  let aboutVal = opportunity.about_company || null;
  if (!aboutVal) {
    aboutVal = findInAdditionalInfo(['about company', 'about']);
  }

  // Resolve Website
  const websiteVal = opportunity.company_website || bi.company_website || opportunity.website || findInAdditionalInfo(['website', 'site', 'url']);

  // Resolve Registration/Apply Link
  const regLinkVal = opportunity.apply_link || opportunity.registration_link || bi.jd_link || atts.jd_link || findInAdditionalInfo(['registration link', 'apply link', 'jd link']);

  // Resolve Last Date/Deadline
  const deadlineVal = opportunity.deadline || bi.application_deadline || findInAdditionalInfo(['deadline', 'last date']);

  // Resolve Course
  const courseVal = opportunity.education_qualification || el.educational_qualification || el.education_qualification || findInAdditionalInfo(['course', 'education']);

  // Resolve Branch
  const branchVal = Array.isArray(el.branches)
    ? el.branches.join(', ')
    : el.branches || el.eligible_branches || findInAdditionalInfo(['branch', 'branches']);

  // Resolve Cut off
  const cutoffVal = el.cgpa || el.cutoff_criteria || el.minimum_cgpa_percentage || findInAdditionalInfo(['cut-off', 'cutoff', 'cgpa']);

  // Resolve Batch
  const batchVal = el.batch || el.passing_batch || findInAdditionalInfo(['batch']);

  // Resolve Salary
  const salaryVal = opportunity.salary || jd.salary_ctc || jd.stipend || findInAdditionalInfo(['salary', 'ctc', 'stipend', 'compensation']);

  // Resolve Role/Designation
  const roleVal = opportunity.role || jd.job_role || findInAdditionalInfo(['designation', 'job role', 'role']);

  // Resolve Responsibilities
  const responsibilitiesVal = Array.isArray(opportunity.responsibilities)
    ? opportunity.responsibilities.join(' • ')
    : opportunity.responsibilities || findInAdditionalInfo(['responsibilities', 'responsibility', 'roles']);

  // Resolve Selection Process
  const selectionProcessVal = Array.isArray(opportunity.interview_process?.description)
    ? opportunity.interview_process.description.join(' → ')
    : el.hiring_process || rp.hiring_process || findInAdditionalInfo(['selection process', 'hiring process', 'rounds']);

  // Resolve Interview Location
  const interviewLocationVal = opportunity.venue || el.venue || sch.venue || findInAdditionalInfo(['interview location', 'venue']);

  // Resolve Campus Interview Date
  const campusDateVal = el.event_date || sch.event_date || findInAdditionalInfo(['interview date', 'campus interview', 'event date']);

  // Resolve Tentative Joining Date
  const joiningDateVal = opportunity.joining_date || findInAdditionalInfo(['joining date']);

  // Resolve Gender Preference
  const genderVal = opportunity.gender_eligibility || el.gender_eligibility || findInAdditionalInfo(['gender']);

  // Resolve Joining Location
  const joiningLocationVal = opportunity.location || el.location || jd.location || jd.work_mode || findInAdditionalInfo(['joining locations', 'joining location', 'location', 'work mode']);

  // Resolve Segment
  const segmentVal = opportunity.type || bi.opportunity_type || findInAdditionalInfo(['job segment', 'type', 'opportunity type']);

  // Resolve Terms
  const termsVal = opportunity.instructions || comm.additional_instructions || findInAdditionalInfo(['terms', 'guidelines', 'condition']);

  // Resolve Skills
  const skillsVal = Array.isArray(opportunity.skills)
    ? opportunity.skills.join(', ')
    : opportunity.skills || findInAdditionalInfo(['skill', 'skills']);

  // Gather values with fallbacks
  const fields = {
    company: opportunity.company || bi.company_name || findInAdditionalInfo(['company name', 'company']) || 'Not Declared',
    aboutCompany: aboutVal || 'Not Specified',
    website: websiteVal || 'Not Specified',
    course: courseVal || 'Not Specified',
    branch: branchVal || 'Not Specified',
    cutoff: cutoffVal || 'Not Specified',
    regLink: regLinkVal || 'Not Specified',
    lastDate: (() => {
      if (!deadlineVal) return 'Not Declared';
      const parsed = new Date(deadlineVal);
      if (isNaN(parsed.getTime())) return String(deadlineVal);
      return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    })(),
    batch: batchVal || 'Not Specified',
    salary: salaryVal || 'Not Declared',
    role: roleVal || 'Not Declared',
    responsibilities: responsibilitiesVal || 'Not Specified',
    selectionProcess: selectionProcessVal || 'Not Specified',
    interviewLocation: interviewLocationVal || 'Not Specified',
    campusDate: campusDateVal || 'Not Specified',
    joiningDate: joiningDateVal || 'Not Specified',
    gender: genderVal || 'Not Specified',
    joiningLocation: joiningLocationVal || 'Not Specified',
    bond: bondVal || 'Not Specified',
    segment: segmentVal || 'Not Specified',
    terms: termsVal || 'Not Specified',
    skills: skillsVal || 'Not Specified',
  };

  const attachments = opportunity.attachments_json || [];
  const pdfAttachments = attachments.filter((a: any) => a.file_type === 'pdf');
  const excelAttachments = attachments.filter((a: any) => a.file_type === 'eligibility_list');
  const otherAttachments = attachments.filter((a: any) => a.file_type !== 'pdf' && a.file_type !== 'eligibility_list');

  return (
    <div className={`group relative rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card overflow-hidden hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/20 transition-all flex flex-col h-full ${isExpired ? 'opacity-75' : ''}`}>
      
      {/* 1. Header Section */}
      <div className="p-6 pb-4 border-b border-slate-100 dark:border-border bg-slate-50/50 dark:bg-muted/10">
        <div className="flex items-start justify-between gap-4">
          <div className="w-12 h-12 rounded-2xl border border-slate-100 dark:border-border bg-slate-100 dark:bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {opportunity.company_logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={opportunity.company_logo} alt={fields.company} className="w-8 h-8 object-contain" />
            ) : (
              <Building2 className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-foreground line-clamp-1">
              {fields.role}
            </h3>
            <p className="text-sm font-semibold text-primary mt-0.5">{fields.company}</p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            {fields.segment}
          </span>
        </div>
      </div>

      {/* 2. Structured Information Blocks */}
      <div className="p-6 space-y-5 flex-1">
        
        {/* About Company */}
        <div className="space-y-1">
          <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> About & Website
          </h4>
          <p className="text-xs text-slate-600 dark:text-foreground/90 line-clamp-2 leading-relaxed">
            {fields.aboutCompany}
          </p>
          {fields.website !== 'Not Specified' && (
            <a href={fields.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1 break-all font-medium">
              <LinkIcon className="w-3 h-3 shrink-0" />
              {fields.website}
            </a>
          )}
        </div>

        {/* Job Details Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-border pt-4">
          <InfoRow label="Salary / CTC" value={fields.salary} icon={<IndianRupee className="w-3.5 h-3.5" />} />
          <InfoRow label="Location" value={fields.joiningLocation} icon={<MapPin className="w-3.5 h-3.5" />} />
          <InfoRow label="Joining Date" value={fields.joiningDate} icon={<Calendar className="w-3.5 h-3.5" />} />
          <InfoRow label="Bond Details" value={fields.bond} icon={<FileText className="w-3.5 h-3.5" />} />
        </div>

        {/* Eligibility Criteria Section */}
        <div className="space-y-2.5 border-t border-slate-100 dark:border-border pt-4">
          <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" /> Eligibility Criteria
          </h4>
          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-muted/20 p-3.5 rounded-2xl border border-slate-100 dark:border-border/30">
            <InfoGridCell label="Course" value={fields.course} />
            <InfoGridCell label="Batch" value={fields.batch} />
            <InfoGridCell label="Cut Off" value={fields.cutoff} />
            <InfoGridCell label="Gender Preference" value={fields.gender} />
            <div className="col-span-2">
              <p className="text-[10px] text-slate-400 dark:text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Eligible Branches</p>
              <p className="text-xs font-semibold text-slate-700 dark:text-foreground/90 line-clamp-1">{fields.branch}</p>
            </div>
          </div>
        </div>

        {/* Job Description & Requirements */}
        <div className="space-y-2 border-t border-slate-100 dark:border-border pt-4">
          <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Skills & Responsibilities
          </h4>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Required Skills</p>
            <p className="text-xs font-medium text-slate-700 dark:text-foreground/90 line-clamp-1">{fields.skills}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Key Responsibilities</p>
            <p className="text-xs text-slate-600 dark:text-foreground/80 line-clamp-2 leading-relaxed">{fields.responsibilities}</p>
          </div>
        </div>

        {/* Recruitment & Selection */}
        <div className="space-y-2 border-t border-slate-100 dark:border-border pt-4">
          <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5" /> Selection & Timeline
          </h4>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 dark:text-muted-foreground font-bold uppercase tracking-wider mr-1.5">Selection:</span>
              <span className="font-semibold text-slate-700 dark:text-foreground/90">{fields.selectionProcess}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 dark:text-muted-foreground font-bold uppercase tracking-wider block mb-0.5">Interview Date</span>
                <span className="font-semibold text-slate-700 dark:text-foreground/90">{fields.campusDate}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-muted-foreground font-bold uppercase tracking-wider block mb-0.5">Interview Location</span>
                <span className="font-semibold text-slate-700 dark:text-foreground/90">{fields.interviewLocation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* File Attachments */}
        {(pdfAttachments.length > 0 || excelAttachments.length > 0 || otherAttachments.length > 0) && (
          <div className="space-y-2 border-t border-slate-100 dark:border-border pt-4">
            <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5" /> Attached Files
            </h4>
            <div className="flex flex-col gap-1.5">
              {pdfAttachments.map((att: any, i: number) => (
                <AttachmentBadge key={i} url={att.url} name={att.file_name} icon="📄" label="Notice PDF" />
              ))}
              {excelAttachments.map((att: any, i: number) => (
                <AttachmentBadge key={i} url={att.url} name={att.file_name} icon="📊" label="Eligibility List" />
              ))}
              {otherAttachments.map((att: any, i: number) => (
                <AttachmentBadge key={i} url={att.url} name={att.file_name} icon="📎" label="Resource File" />
              ))}
            </div>
          </div>
        )}

        {/* Terms & Instructions */}
        <div className="space-y-1 border-t border-slate-100 dark:border-border pt-4">
          <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-muted-foreground uppercase tracking-widest">
            Terms & Conditions / Guidelines
          </h4>
          <p className="text-xs text-slate-500 dark:text-muted-foreground line-clamp-2 leading-relaxed">
            {fields.terms}
          </p>
        </div>

      </div>

      {/* 3. Footer Section */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-muted/50 border-t border-slate-100 dark:border-border flex items-center justify-between text-sm mt-auto">
        <CountdownTimer deadline={opportunity.deadline} />
        
        <div className="flex items-center gap-3">
          {fields.regLink !== 'Not Specified' && (
            <a
              href={fields.regLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-1"
            >
              Apply Link
              <LinkIcon className="w-3 h-3" />
            </a>
          )}

          {onViewDetails ? (
            <button
              type="button"
              onClick={onViewDetails}
              className="flex items-center gap-1 font-bold text-primary hover:text-primary/80 transition-all group/btn"
            >
              View Full
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          ) : String(opportunity.id).startsWith('preview') ? (
            <span className="flex items-center gap-1 font-semibold text-slate-300 cursor-not-allowed">
              View Full
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          ) : (
            <Link
              href={`/opportunities/${opportunity.id}`}
              className="flex items-center gap-1 font-bold text-primary hover:text-primary/80 transition-all group/btn"
            >
              View Full
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="text-slate-400 dark:text-muted-foreground mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 dark:text-muted-foreground font-bold uppercase tracking-wider">{label}</p>
        <p className="text-xs font-semibold text-slate-700 dark:text-foreground/90 truncate">{value}</p>
      </div>
    </div>
  );
}

function InfoGridCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-slate-400 dark:text-muted-foreground font-bold uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-xs font-semibold text-slate-700 dark:text-foreground/90 truncate">{value}</p>
    </div>
  );
}

function AttachmentBadge({ url, name, icon, label }: { url: string; name: string; icon: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-2 rounded-xl border border-slate-100 dark:border-border/30 bg-slate-50/50 dark:bg-muted/10 hover:bg-slate-50 dark:hover:bg-muted/20 hover:border-primary/20 transition-all text-xs"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm shrink-0">{icon}</span>
        <div className="min-w-0">
          <p className="font-medium text-slate-700 dark:text-foreground/90 truncate">{name}</p>
          <p className="text-[9px] text-slate-400 dark:text-muted-foreground uppercase tracking-wider">{label}</p>
        </div>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
    </a>
  );
}

export function OpportunityCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white h-[400px] animate-pulse" />
  );
}
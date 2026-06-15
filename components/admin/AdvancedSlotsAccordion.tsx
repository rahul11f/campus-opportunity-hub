'use client';

import { useState } from 'react';
import {
  ChevronDown, ChevronUp, Info, ShieldCheck, GraduationCap, Award, HelpCircle, Calendar, Users2, Link2, Briefcase, FileText, Settings
} from 'lucide-react';

export function AdvancedSlotsAccordion({ form, setForm }: { form: any, setForm: any }) {
  const [openSection, setOpenSection] = useState<number | null>(null);

  function toggleSection(sectionId: number) {
    setOpenSection(openSection === sectionId ? null : sectionId);
  }

  function updateSlot(key: string, value: string) {
    setForm((prev: any) => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        [key]: value
      }
    }));
  }

  const e = form.eligibility || {};

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Info className="w-5 h-5 text-blue-500" /> Detailed Information Slots
      </h3>
      <p className="text-sm text-muted-foreground -mt-2 mb-4">
        Expand categories to review or edit extracted data slots manually.
      </p>

      {/* 1. Basic Information */}
      <div className="border rounded-2xl overflow-hidden bg-card">
        <button type="button" onClick={() => toggleSection(1)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-accent transition-colors">
          <span className="font-semibold text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> 1. Basic Information</span>
          {openSection === 1 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {openSection === 1 && (
          <div className="p-5 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-xs text-muted-foreground block mb-1">Company Name</label><input value={e.company_name || form.company || ''} onChange={ev => updateSlot('company_name', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Company Logo URL</label><input value={e.company_logo_url || ''} onChange={ev => updateSlot('company_logo_url', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Opportunity Title</label><input value={e.opportunity_title || form.role || ''} onChange={ev => updateSlot('opportunity_title', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Opportunity Type</label><input value={e.opportunity_type || form.type || ''} onChange={ev => updateSlot('opportunity_type', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Job Role / Position</label><input value={e.job_role_position || ''} onChange={ev => updateSlot('job_role_position', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Job Segment / Department</label><input value={e.job_segment_department || ''} onChange={ev => updateSlot('job_segment_department', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div className="md:col-span-2"><label className="text-xs text-muted-foreground block mb-1">Company Description</label><textarea value={e.company_description || ''} onChange={ev => updateSlot('company_description', ev.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Official Website</label><input value={e.official_website || ''} onChange={ev => updateSlot('official_website', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Registration / Apply Link</label><input value={e.registration_apply_link || form.apply_link || ''} onChange={ev => updateSlot('registration_apply_link', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">JD Link</label><input value={e.jd_link || ''} onChange={ev => updateSlot('jd_link', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Verified Badge Toggle</label><input value={e.verified_badge_toggle || ''} onChange={ev => updateSlot('verified_badge_toggle', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" placeholder="Yes/No" /></div>
          </div>
        )}
      </div>

      {/* 2. Eligibility Criteria */}
      <div className="border rounded-2xl overflow-hidden bg-card">
        <button type="button" onClick={() => toggleSection(2)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-accent transition-colors">
          <span className="font-semibold text-sm flex items-center gap-2"><GraduationCap className="w-4 h-4 text-blue-500" /> 2. Eligibility Criteria</span>
          {openSection === 2 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {openSection === 2 && (
          <div className="p-5 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-xs text-muted-foreground block mb-1">Eligible Courses</label><input value={e.eligible_courses || ''} onChange={ev => updateSlot('eligible_courses', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Eligible Branches</label><input value={e.eligible_branches || e.branches || ''} onChange={ev => updateSlot('eligible_branches', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Eligible Streams</label><input value={e.eligible_streams || ''} onChange={ev => updateSlot('eligible_streams', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Passing Batch / Year</label><input value={e.passing_batch_year || e.batch || ''} onChange={ev => updateSlot('passing_batch_year', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Minimum Percentage / CGPA</label><input value={e.minimum_percentage_cgpa || e.cgpa || ''} onChange={ev => updateSlot('minimum_percentage_cgpa', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Active Backlogs Allowed</label><input value={e.active_backlogs_allowed || e.backlog || ''} onChange={ev => updateSlot('active_backlogs_allowed', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Gender Preference</label><input value={e.gender_preference || ''} onChange={ev => updateSlot('gender_preference', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Age Criteria</label><input value={e.age_criteria || ''} onChange={ev => updateSlot('age_criteria', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Bond Details</label><input value={e.bond_details || ''} onChange={ev => updateSlot('bond_details', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div className="md:col-span-2"><label className="text-xs text-muted-foreground block mb-1">Other Eligibility Notes</label><textarea value={e.other_eligibility_notes || e.other || ''} onChange={ev => updateSlot('other_eligibility_notes', ev.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
          </div>
        )}
      </div>

      {/* 3. Compensation & Benefits */}
      <div className="border rounded-2xl overflow-hidden bg-card">
        <button type="button" onClick={() => toggleSection(3)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-accent transition-colors">
          <span className="font-semibold text-sm flex items-center gap-2"><Award className="w-4 h-4 text-purple-500" /> 3. Compensation & Benefits</span>
          {openSection === 3 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {openSection === 3 && (
          <div className="p-5 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-xs text-muted-foreground block mb-1">Salary / CTC</label><input value={e.salary_ctc || form.salary || ''} onChange={ev => updateSlot('salary_ctc', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Stipend</label><input value={e.stipend || ''} onChange={ev => updateSlot('stipend', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Training Duration</label><input value={e.training_duration || ''} onChange={ev => updateSlot('training_duration', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Probation Period</label><input value={e.probation_period || ''} onChange={ev => updateSlot('probation_period', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Incentives / Bonuses</label><input value={e.incentives_bonuses || ''} onChange={ev => updateSlot('incentives_bonuses', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Joining Bonus</label><input value={e.joining_bonus || ''} onChange={ev => updateSlot('joining_bonus', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div className="md:col-span-2"><label className="text-xs text-muted-foreground block mb-1">Perks / Benefits</label><textarea value={e.perks_benefits || ''} onChange={ev => updateSlot('perks_benefits', ev.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
          </div>
        )}
      </div>

      {/* 4. Job Details */}
      <div className="border rounded-2xl overflow-hidden bg-card">
        <button type="button" onClick={() => toggleSection(4)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-accent transition-colors">
          <span className="font-semibold text-sm flex items-center gap-2"><Briefcase className="w-4 h-4 text-cyan-500" /> 4. Job Details</span>
          {openSection === 4 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {openSection === 4 && (
          <div className="p-5 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-xs text-muted-foreground block mb-1">Work Location</label><input value={e.work_location || form.location || ''} onChange={ev => updateSlot('work_location', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Interview Location</label><input value={e.interview_location || ''} onChange={ev => updateSlot('interview_location', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Work Mode (Remote / Hybrid / Onsite)</label><input value={e.work_mode || ''} onChange={ev => updateSlot('work_mode', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Employment Type</label><input value={e.employment_type || ''} onChange={ev => updateSlot('employment_type', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Joining Date</label><input value={e.joining_date || ''} onChange={ev => updateSlot('joining_date', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Number of Openings</label><input value={e.number_of_openings || ''} onChange={ev => updateSlot('number_of_openings', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
          </div>
        )}
      </div>

      {/* 5. Recruitment Process */}
      <div className="border rounded-2xl overflow-hidden bg-card">
        <button type="button" onClick={() => toggleSection(5)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-accent transition-colors">
          <span className="font-semibold text-sm flex items-center gap-2"><HelpCircle className="w-4 h-4 text-amber-500" /> 5. Recruitment Process</span>
          {openSection === 5 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {openSection === 5 && (
          <div className="p-5 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="text-xs text-muted-foreground block mb-1">Selection Process Steps</label><textarea value={e.selection_process_steps || ''} onChange={ev => updateSlot('selection_process_steps', ev.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Number of Rounds</label><input value={e.number_of_rounds || ''} onChange={ev => updateSlot('number_of_rounds', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Assessment Test Required</label><input value={e.assessment_test_required || ''} onChange={ev => updateSlot('assessment_test_required', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Group Discussion Required</label><input value={e.group_discussion_required || ''} onChange={ev => updateSlot('group_discussion_required', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Technical Interview</label><input value={e.technical_interview || ''} onChange={ev => updateSlot('technical_interview', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">HR Interview</label><input value={e.hr_interview || ''} onChange={ev => updateSlot('hr_interview', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Managerial Interview</label><input value={e.managerial_interview || ''} onChange={ev => updateSlot('managerial_interview', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div className="md:col-span-2"><label className="text-xs text-muted-foreground block mb-1">Other Rounds Notes</label><textarea value={e.other_rounds_notes || ''} onChange={ev => updateSlot('other_rounds_notes', ev.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
          </div>
        )}
      </div>

      {/* 6. Skills & Requirements */}
      <div className="border rounded-2xl overflow-hidden bg-card">
        <button type="button" onClick={() => toggleSection(6)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-accent transition-colors">
          <span className="font-semibold text-sm flex items-center gap-2"><Award className="w-4 h-4 text-yellow-500" /> 6. Skills & Requirements</span>
          {openSection === 6 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {openSection === 6 && (
          <div className="p-5 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="text-xs text-muted-foreground block mb-1">Required Skills</label><textarea value={e.required_skills || ''} onChange={ev => updateSlot('required_skills', ev.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div className="md:col-span-2"><label className="text-xs text-muted-foreground block mb-1">Preferred Skills</label><textarea value={e.preferred_skills || ''} onChange={ev => updateSlot('preferred_skills', ev.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Communication Skills Required</label><input value={e.communication_skills_required || ''} onChange={ev => updateSlot('communication_skills_required', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Technical Skills Required</label><input value={e.technical_skills_required || ''} onChange={ev => updateSlot('technical_skills_required', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Personality Traits / Expectations</label><input value={e.personality_traits_expectations || ''} onChange={ev => updateSlot('personality_traits_expectations', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Certifications (Optional)</label><input value={e.certifications || ''} onChange={ev => updateSlot('certifications', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
          </div>
        )}
      </div>

      {/* 7. Roles & Responsibilities */}
      <div className="border rounded-2xl overflow-hidden bg-card">
        <button type="button" onClick={() => toggleSection(7)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-accent transition-colors">
          <span className="font-semibold text-sm flex items-center gap-2"><Users2 className="w-4 h-4 text-indigo-500" /> 7. Roles & Responsibilities</span>
          {openSection === 7 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {openSection === 7 && (
          <div className="p-5 border-t">
            <label className="text-xs text-muted-foreground block mb-1">Responsibilities List (Comma separated or bullet points)</label>
            <textarea value={e.responsibilities_list || ''} onChange={ev => updateSlot('responsibilities_list', ev.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
          </div>
        )}
      </div>

      {/* 8. Application & Schedule */}
      <div className="border rounded-2xl overflow-hidden bg-card">
        <button type="button" onClick={() => toggleSection(8)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-accent transition-colors">
          <span className="font-semibold text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-pink-500" /> 8. Application & Schedule</span>
          {openSection === 8 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {openSection === 8 && (
          <div className="p-5 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-xs text-muted-foreground block mb-1">Application Start Date</label><input value={e.application_start_date || ''} onChange={ev => updateSlot('application_start_date', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Application Deadline</label><input value={e.application_deadline || form.deadline || ''} onChange={ev => updateSlot('application_deadline', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Event Date</label><input value={e.event_date || ''} onChange={ev => updateSlot('event_date', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Event Time</label><input value={e.event_time || ''} onChange={ev => updateSlot('event_time', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Venue</label><input value={e.venue || ''} onChange={ev => updateSlot('venue', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Application Instructions</label><input value={e.application_instructions || ''} onChange={ev => updateSlot('application_instructions', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div className="md:col-span-2"><label className="text-xs text-muted-foreground block mb-1">Important Notes</label><textarea value={e.important_notes || ''} onChange={ev => updateSlot('important_notes', ev.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
          </div>
        )}
      </div>

      {/* 9. Attachments & Resources */}
      <div className="border rounded-2xl overflow-hidden bg-card">
        <button type="button" onClick={() => toggleSection(9)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-accent transition-colors">
          <span className="font-semibold text-sm flex items-center gap-2"><Link2 className="w-4 h-4 text-emerald-500" /> 9. Attachments & Resources</span>
          {openSection === 9 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {openSection === 9 && (
          <div className="p-5 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-xs text-muted-foreground block mb-1">PDF Notice Upload / Link</label><input value={e.pdf_notice_upload || ''} onChange={ev => updateSlot('pdf_notice_upload', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Company Brochure Link</label><input value={e.company_brochure || ''} onChange={ev => updateSlot('company_brochure', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">JD PDF Upload / Link</label><input value={e.jd_pdf_upload || ''} onChange={ev => updateSlot('jd_pdf_upload', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Additional Documents Link</label><input value={e.additional_documents || ''} onChange={ev => updateSlot('additional_documents', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div className="md:col-span-2"><label className="text-xs text-muted-foreground block mb-1">Student Eligible List Upload / Link</label><input value={e.student_eligible_list_upload || ''} onChange={ev => updateSlot('student_eligible_list_upload', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
          </div>
        )}
      </div>

      {/* 10. Source Metadata / Admin Info */}
      <div className="border rounded-2xl overflow-hidden bg-card">
        <button type="button" onClick={() => toggleSection(10)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-accent transition-colors">
          <span className="font-semibold text-sm flex items-center gap-2"><Settings className="w-4 h-4 text-slate-500" /> 10. Source Metadata / Admin Info</span>
          {openSection === 10 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {openSection === 10 && (
          <div className="p-5 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-xs text-muted-foreground block mb-1">Posted By</label><input value={e.posted_by || ''} onChange={ev => updateSlot('posted_by', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Institution / College Name</label><input value={e.institution_college_name || ''} onChange={ev => updateSlot('institution_college_name', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Source Type</label><input value={e.source_type || ''} onChange={ev => updateSlot('source_type', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Notice Date</label><input value={e.notice_date || ''} onChange={ev => updateSlot('notice_date', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Tags / Categories</label><input value={e.tags_categories || ''} onChange={ev => updateSlot('tags_categories', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Priority Level</label><input value={e.priority_level || ''} onChange={ev => updateSlot('priority_level', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Publish Status</label><input value={e.publish_status || ''} onChange={ev => updateSlot('publish_status', ev.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" /></div>
          </div>
        )}
      </div>

      {/* Section 11: Custom Category Slots */}
      <div className="border rounded-2xl overflow-hidden bg-card border-primary/20 bg-primary/5">
        <div className="p-5">
          <p className="text-sm font-semibold mb-3">Add Custom Category Slot</p>
          <div className="flex gap-2 mb-4">
            <input 
              placeholder="Category Name (e.g. Driving License Needed)" 
              className="flex-1 border rounded-lg p-2 text-sm bg-background" 
              id="customKeyInput"
            />
            <input 
              placeholder="Value (e.g. Yes / Required)" 
              className="flex-1 border rounded-lg p-2 text-sm bg-background" 
              id="customValInput"
            />
            <button 
              type="button"
              onClick={() => {
                const kInput = document.getElementById('customKeyInput') as HTMLInputElement;
                const vInput = document.getElementById('customValInput') as HTMLInputElement;
                const k = kInput.value.trim().toLowerCase().replace(/\s+/g, '_');
                const v = vInput.value.trim();
                if(k && v) {
                  updateSlot(k, v);
                  kInput.value = '';
                  vInput.value = '';
                }
              }} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(e).map(([k, v]) => {
              if (
                ['branches', 'cgpa', 'backlog', 'batch', 'other', 'company_name', 'company_logo_url', 'opportunity_title', 'opportunity_type', 'job_role_position', 'job_segment_department', 'company_description', 'official_website', 'registration_apply_link', 'jd_link', 'verified_badge_toggle', 'eligible_courses', 'eligible_branches', 'eligible_streams', 'passing_batch_year', 'minimum_percentage_cgpa', 'active_backlogs_allowed', 'gender_preference', 'age_criteria', 'bond_details', 'other_eligibility_notes', 'salary_ctc', 'stipend', 'training_duration', 'probation_period', 'incentives_bonuses', 'joining_bonus', 'perks_benefits', 'work_location', 'interview_location', 'work_mode', 'employment_type', 'joining_date', 'number_of_openings', 'selection_process_steps', 'number_of_rounds', 'assessment_test_required', 'group_discussion_required', 'technical_interview', 'hr_interview', 'managerial_interview', 'other_rounds_notes', 'required_skills', 'preferred_skills', 'communication_skills_required', 'technical_skills_required', 'personality_traits_expectations', 'certifications', 'responsibilities_list', 'application_start_date', 'application_deadline', 'event_date', 'event_time', 'venue', 'application_instructions', 'important_notes', 'pdf_notice_upload', 'company_brochure', 'jd_pdf_upload', 'additional_documents', 'student_eligible_list_upload', 'posted_by', 'institution_college_name', 'source_type', 'notice_date', 'tags_categories', 'priority_level', 'publish_status'].includes(k)
              ) return null;
              if (typeof v !== 'string' && typeof v !== 'number') return null;
              
              return (
                <div key={k} className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-lg text-sm border">
                  <span className="font-semibold text-muted-foreground">{k.replace(/_/g, ' ')}:</span> 
                  <span className="font-medium">{String(v)}</span>
                  <button type="button" onClick={() => {
                    const newEl = { ...e };
                    delete newEl[k];
                    setForm((prev: any) => ({ ...prev, eligibility: newEl }));
                  }} className="ml-2 text-red-500 font-bold hover:text-red-700">×</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}

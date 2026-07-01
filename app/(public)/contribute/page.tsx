'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Send, FileText, Link2, ChevronDown, ChevronUp, CheckCircle, Info, ShieldCheck, GraduationCap, Award, HelpCircle, Users2, Calendar, Briefcase, Settings, Wand2, PlusCircle } from 'lucide-react';
import { StudentAIParser } from '@/components/student/StudentAIParser';

export default function ContributePage() {
  const [submitting, setSubmitting] = useState(false);
  const [openSection, setOpenSection] = useState<number | null>(1);
  const [mode, setMode] = useState<'manual' | 'ai'>('ai');

  const [form, setForm] = useState<any>({
    title: '',
    contributionType: 'placement',
    content: '',
    sourceLink: '',
    slots: {}
  });

  function toggleSection(sectionId: number) {
    setOpenSection(openSection === sectionId ? null : sectionId);
  }

  function updateSlot(key: string, value: string) {
    setForm((prev: any) => ({
      ...prev,
      slots: {
        ...prev.slots,
        [key]: value
      }
    }));
  }

  const e = form.slots;

  async function submitContribution() {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      setSubmitting(true);

      const slotsReport = `
# Structured Opportunity Slots

### 1. Basic Information
- **Company Name**: ${e.company_name || form.title}
- **Company Logo URL**: ${e.company_logo_url || 'Not Mentioned'}
- **Opportunity Title**: ${e.opportunity_title || form.title}
- **Opportunity Type**: ${e.opportunity_type || form.contributionType}
- **Job Role / Position**: ${e.job_role_position || 'Not Mentioned'}
- **Job Segment / Department**: ${e.job_segment_department || 'Not Mentioned'}
- **Company Description**: ${e.company_description || 'Not Mentioned'}
- **Official Website**: ${e.official_website || 'Not Mentioned'}
- **Registration / Apply Link**: ${e.registration_apply_link || form.sourceLink || 'Not Mentioned'}
- **JD Link**: ${e.jd_link || 'Not Mentioned'}
- **Verified Badge Toggle**: ${e.verified_badge_toggle || 'Not Mentioned'}

### 2. Eligibility Criteria
- **Eligible Courses**: ${e.eligible_courses || 'Not Mentioned'}
- **Eligible Branches**: ${e.eligible_branches || 'Not Mentioned'}
- **Eligible Streams**: ${e.eligible_streams || 'Not Mentioned'}
- **Passing Batch / Year**: ${e.passing_batch_year || 'Not Mentioned'}
- **Minimum Percentage / CGPA**: ${e.minimum_percentage_cgpa || 'Not Mentioned'}
- **Active Backlogs Allowed**: ${e.active_backlogs_allowed || 'Not Mentioned'}
- **Gender Preference**: ${e.gender_preference || 'Not Mentioned'}
- **Age Criteria**: ${e.age_criteria || 'Not Mentioned'}
- **Bond Details**: ${e.bond_details || 'Not Mentioned'}
- **Other Eligibility Notes**: ${e.other_eligibility_notes || 'Not Mentioned'}

### 3. Compensation & Benefits
- **Salary / CTC**: ${e.salary_ctc || 'Not Mentioned'}
- **Stipend**: ${e.stipend || 'Not Mentioned'}
- **Training Duration**: ${e.training_duration || 'Not Mentioned'}
- **Probation Period**: ${e.probation_period || 'Not Mentioned'}
- **Incentives / Bonuses**: ${e.incentives_bonuses || 'Not Mentioned'}
- **Joining Bonus**: ${e.joining_bonus || 'Not Mentioned'}
- **Perks / Benefits**: ${e.perks_benefits || 'Not Mentioned'}

### 4. Job Details
- **Work Location**: ${e.work_location || 'Not Mentioned'}
- **Interview Location**: ${e.interview_location || 'Not Mentioned'}
- **Work Mode**: ${e.work_mode || 'Not Mentioned'}
- **Employment Type**: ${e.employment_type || 'Not Mentioned'}
- **Joining Date**: ${e.joining_date || 'Not Mentioned'}
- **Number of Openings**: ${e.number_of_openings || 'Not Mentioned'}

### 5. Recruitment Process
- **Selection Process Steps**: ${e.selection_process_steps || 'Not Mentioned'}
- **Number of Rounds**: ${e.number_of_rounds || 'Not Mentioned'}
- **Assessment Test Required**: ${e.assessment_test_required || 'Not Mentioned'}
- **Group Discussion Required**: ${e.group_discussion_required || 'Not Mentioned'}
- **Technical Interview**: ${e.technical_interview || 'Not Mentioned'}
- **HR Interview**: ${e.hr_interview || 'Not Mentioned'}
- **Managerial Interview**: ${e.managerial_interview || 'Not Mentioned'}
- **Other Rounds Notes**: ${e.other_rounds_notes || 'Not Mentioned'}

### 6. Skills & Requirements
- **Required Skills**: ${e.required_skills || 'Not Mentioned'}
- **Preferred Skills**: ${e.preferred_skills || 'Not Mentioned'}
- **Communication Skills Required**: ${e.communication_skills_required || 'Not Mentioned'}
- **Technical Skills Required**: ${e.technical_skills_required || 'Not Mentioned'}
- **Personality Traits / Expectations**: ${e.personality_traits_expectations || 'Not Mentioned'}
- **Certifications**: ${e.certifications || 'Not Mentioned'}

### 7. Roles & Responsibilities
- **Responsibilities List**: ${e.responsibilities_list || 'Not Mentioned'}

### 8. Application & Schedule
- **Application Start Date**: ${e.application_start_date || 'Not Mentioned'}
- **Application Deadline**: ${e.application_deadline || 'Not Mentioned'}
- **Event Date**: ${e.event_date || 'Not Mentioned'}
- **Event Time**: ${e.event_time || 'Not Mentioned'}
- **Venue**: ${e.venue || 'Not Mentioned'}
- **Application Instructions**: ${e.application_instructions || 'Not Mentioned'}
- **Important Notes**: ${e.important_notes || 'Not Mentioned'}

### 9. Attachments & Resources
- **PDF Notice Upload**: ${e.pdf_notice_upload || 'Not Mentioned'}
- **Company Brochure**: ${e.company_brochure || 'Not Mentioned'}
- **JD PDF Upload**: ${e.jd_pdf_upload || 'Not Mentioned'}
- **Additional Documents**: ${e.additional_documents || 'Not Mentioned'}
- **Student Eligible List Upload**: ${e.student_eligible_list_upload || 'Not Mentioned'}

### 10. Source Metadata / Admin Info
- **Posted By**: ${e.posted_by || 'Not Mentioned'}
- **Institution / College Name**: ${e.institution_college_name || 'Not Mentioned'}
- **Source Type**: ${e.source_type || 'Not Mentioned'}
- **Notice Date**: ${e.notice_date || 'Not Mentioned'}
- **Tags / Categories**: ${e.tags_categories || 'Not Mentioned'}
- **Priority Level**: ${e.priority_level || 'Not Mentioned'}
- **Publish Status**: ${e.publish_status || 'Not Mentioned'}

---
[SLOTS_JSON_DATA]
${JSON.stringify({ eligibility: e, ...form }, null, 2)}
[/SLOTS_JSON_DATA]
`;

      const finalContent = form.content.trim() 
        ? `${form.content.trim()}\n\n${slotsReport}` 
        : slotsReport;

      const res = await fetch('/api/student/contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title.trim(),
          contributionType: form.contributionType,
          content: finalContent,
          sourceLink: form.sourceLink.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      toast.success('Contribution submitted successfully for Admin review!');

      // Reset Form State
      setForm({
        title: '',
        contributionType: 'placement',
        content: '',
        sourceLink: '',
        slots: {}
      });
      setOpenSection(1);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : 'Submission failed'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
          Contribute Opportunity Notice
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Fill out all available fields manually or use the AI parser to scan flyers and links to submit notice contributions for verified approval.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-xl max-w-sm mb-6">
        <button
          onClick={() => setMode('ai')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
            mode === 'ai'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          AI Notice Parser
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
            mode === 'manual'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Manual Form
        </button>
      </div>

      {mode === 'ai' ? (
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-card">
          <StudentAIParser />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-card transition-all">
        {/* Core Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Opportunity / Notice Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-4 top-4 text-muted-foreground" />
              <input
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="e.g. TCS Ninja Off-Campus Drive"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category / Type
            </label>
            <select
              value={form.contributionType}
              onChange={(e) => setForm({...form, contributionType: e.target.value})}
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            >
              <option value="placement">Placement Drive</option>
              <option value="internship">Internship Drive</option>
              <option value="academic_notice">Academic Notice</option>
              <option value="exam_notice">Exam / Results Notice</option>
              <option value="important_links">Important Resource / Link</option>
              <option value="other">Other / General Update</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Primary Source Link (Optional)
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 absolute left-4 top-4 text-muted-foreground" />
              <input
                value={form.sourceLink}
                onChange={(e) => setForm({...form, sourceLink: e.target.value})}
                placeholder="https://tcs.com/careers"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              />
            </div>
          </div>
        </div>

        {/* Collapsible Slots Accordion */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" /> Detailed Information Slots
          </h3>
          <p className="text-xs text-muted-foreground -mt-2">
            Click each category card to fill detailed information slots directly.
          </p>

          {/* 1. Basic Information */}
          <div className="border border-border rounded-2xl overflow-hidden bg-muted/20">
            <button onClick={() => toggleSection(1)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <span className="font-semibold text-sm text-foreground flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> 1. Basic Information</span>
              {openSection === 1 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {openSection === 1 && (
              <div className="p-5 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground block mb-1">Company Name</label><input value={e.company_name || ''} onChange={ev => updateSlot('company_name', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Company Logo URL</label><input value={e.company_logo_url || ''} onChange={ev => updateSlot('company_logo_url', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Opportunity Title</label><input value={e.opportunity_title || ''} onChange={ev => updateSlot('opportunity_title', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Opportunity Type</label><input value={e.opportunity_type || ''} onChange={ev => updateSlot('opportunity_type', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Job Role / Position</label><input value={e.job_role_position || ''} onChange={ev => updateSlot('job_role_position', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Job Segment / Department</label><input value={e.job_segment_department || ''} onChange={ev => updateSlot('job_segment_department', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div className="md:col-span-2"><label className="text-xs text-muted-foreground block mb-1">Company Description</label><textarea value={e.company_description || ''} onChange={ev => updateSlot('company_description', ev.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Official Website</label><input value={e.official_website || ''} onChange={ev => updateSlot('official_website', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Registration / Apply Link</label><input value={e.registration_apply_link || ''} onChange={ev => updateSlot('registration_apply_link', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">JD Link</label><input value={e.jd_link || ''} onChange={ev => updateSlot('jd_link', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Verified Badge Toggle</label><input value={e.verified_badge_toggle || ''} onChange={ev => updateSlot('verified_badge_toggle', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" placeholder="Yes/No" /></div>
              </div>
            )}
          </div>

          {/* 2. Eligibility Criteria */}
          <div className="border border-border rounded-2xl overflow-hidden bg-muted/20">
            <button onClick={() => toggleSection(2)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <span className="font-semibold text-sm text-foreground flex items-center gap-2"><GraduationCap className="w-4 h-4 text-blue-500" /> 2. Eligibility Criteria</span>
              {openSection === 2 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {openSection === 2 && (
              <div className="p-5 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground block mb-1">Eligible Courses</label><input value={e.eligible_courses || ''} onChange={ev => updateSlot('eligible_courses', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Eligible Branches</label><input value={e.eligible_branches || ''} onChange={ev => updateSlot('eligible_branches', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Eligible Streams</label><input value={e.eligible_streams || ''} onChange={ev => updateSlot('eligible_streams', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Passing Batch / Year</label><input value={e.passing_batch_year || ''} onChange={ev => updateSlot('passing_batch_year', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Minimum Percentage / CGPA</label><input value={e.minimum_percentage_cgpa || ''} onChange={ev => updateSlot('minimum_percentage_cgpa', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Active Backlogs Allowed</label><input value={e.active_backlogs_allowed || ''} onChange={ev => updateSlot('active_backlogs_allowed', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Gender Preference</label><input value={e.gender_preference || ''} onChange={ev => updateSlot('gender_preference', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Age Criteria</label><input value={e.age_criteria || ''} onChange={ev => updateSlot('age_criteria', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Bond Details</label><input value={e.bond_details || ''} onChange={ev => updateSlot('bond_details', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div className="md:col-span-2"><label className="text-xs text-muted-foreground block mb-1">Other Eligibility Notes</label><textarea value={e.other_eligibility_notes || ''} onChange={ev => updateSlot('other_eligibility_notes', ev.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
              </div>
            )}
          </div>

          {/* 3. Compensation & Benefits */}
          <div className="border border-border rounded-2xl overflow-hidden bg-muted/20">
            <button type="button" onClick={() => toggleSection(3)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <span className="font-semibold text-sm text-foreground flex items-center gap-2"><Award className="w-4 h-4 text-purple-500" /> 3. Compensation & Benefits</span>
              {openSection === 3 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {openSection === 3 && (
              <div className="p-5 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground block mb-1">Salary / CTC</label><input value={e.salary_ctc || ''} onChange={ev => updateSlot('salary_ctc', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Stipend</label><input value={e.stipend || ''} onChange={ev => updateSlot('stipend', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Training Duration</label><input value={e.training_duration || ''} onChange={ev => updateSlot('training_duration', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Probation Period</label><input value={e.probation_period || ''} onChange={ev => updateSlot('probation_period', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Incentives / Bonuses</label><input value={e.incentives_bonuses || ''} onChange={ev => updateSlot('incentives_bonuses', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Joining Bonus</label><input value={e.joining_bonus || ''} onChange={ev => updateSlot('joining_bonus', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div className="md:col-span-2"><label className="text-xs text-muted-foreground block mb-1">Perks / Benefits</label><textarea value={e.perks_benefits || ''} onChange={ev => updateSlot('perks_benefits', ev.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
              </div>
            )}
          </div>

          {/* 4. Job Details */}
          <div className="border border-border rounded-2xl overflow-hidden bg-muted/20">
            <button type="button" onClick={() => toggleSection(4)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <span className="font-semibold text-sm text-foreground flex items-center gap-2"><Briefcase className="w-4 h-4 text-cyan-500" /> 4. Job Details</span>
              {openSection === 4 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {openSection === 4 && (
              <div className="p-5 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground block mb-1">Work Location</label><input value={e.work_location || ''} onChange={ev => updateSlot('work_location', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Interview Location</label><input value={e.interview_location || ''} onChange={ev => updateSlot('interview_location', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Work Mode (Remote / Hybrid / Onsite)</label><input value={e.work_mode || ''} onChange={ev => updateSlot('work_mode', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Employment Type</label><input value={e.employment_type || ''} onChange={ev => updateSlot('employment_type', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Joining Date</label><input value={e.joining_date || ''} onChange={ev => updateSlot('joining_date', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Number of Openings</label><input value={e.number_of_openings || ''} onChange={ev => updateSlot('number_of_openings', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
              </div>
            )}
          </div>

          {/* 5. Recruitment Process */}
          <div className="border border-border rounded-2xl overflow-hidden bg-muted/20">
            <button type="button" onClick={() => toggleSection(5)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <span className="font-semibold text-sm text-foreground flex items-center gap-2"><HelpCircle className="w-4 h-4 text-amber-500" /> 5. Recruitment Process</span>
              {openSection === 5 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {openSection === 5 && (
              <div className="p-5 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className="text-xs text-muted-foreground block mb-1">Selection Process Steps</label><textarea value={e.selection_process_steps || ''} onChange={ev => updateSlot('selection_process_steps', ev.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Number of Rounds</label><input value={e.number_of_rounds || ''} onChange={ev => updateSlot('number_of_rounds', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Assessment Test Required</label><input value={e.assessment_test_required || ''} onChange={ev => updateSlot('assessment_test_required', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Group Discussion Required</label><input value={e.group_discussion_required || ''} onChange={ev => updateSlot('group_discussion_required', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Technical Interview</label><input value={e.technical_interview || ''} onChange={ev => updateSlot('technical_interview', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">HR Interview</label><input value={e.hr_interview || ''} onChange={ev => updateSlot('hr_interview', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Managerial Interview</label><input value={e.managerial_interview || ''} onChange={ev => updateSlot('managerial_interview', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div className="md:col-span-2"><label className="text-xs text-muted-foreground block mb-1">Other Rounds Notes</label><textarea value={e.other_rounds_notes || ''} onChange={ev => updateSlot('other_rounds_notes', ev.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
              </div>
            )}
          </div>

          {/* 6. Skills & Requirements */}
          <div className="border border-border rounded-2xl overflow-hidden bg-muted/20">
            <button type="button" onClick={() => toggleSection(6)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <span className="font-semibold text-sm text-foreground flex items-center gap-2"><Award className="w-4 h-4 text-yellow-500" /> 6. Skills & Requirements</span>
              {openSection === 6 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {openSection === 6 && (
              <div className="p-5 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className="text-xs text-muted-foreground block mb-1">Required Skills</label><textarea value={e.required_skills || ''} onChange={ev => updateSlot('required_skills', ev.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div className="md:col-span-2"><label className="text-xs text-muted-foreground block mb-1">Preferred Skills</label><textarea value={e.preferred_skills || ''} onChange={ev => updateSlot('preferred_skills', ev.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Communication Skills Required</label><input value={e.communication_skills_required || ''} onChange={ev => updateSlot('communication_skills_required', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Technical Skills Required</label><input value={e.technical_skills_required || ''} onChange={ev => updateSlot('technical_skills_required', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Personality Traits / Expectations</label><input value={e.personality_traits_expectations || ''} onChange={ev => updateSlot('personality_traits_expectations', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Certifications (Optional)</label><input value={e.certifications || ''} onChange={ev => updateSlot('certifications', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
              </div>
            )}
          </div>

          {/* 7. Roles & Responsibilities */}
          <div className="border border-border rounded-2xl overflow-hidden bg-muted/20">
            <button type="button" onClick={() => toggleSection(7)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <span className="font-semibold text-sm text-foreground flex items-center gap-2"><Users2 className="w-4 h-4 text-indigo-500" /> 7. Roles & Responsibilities</span>
              {openSection === 7 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {openSection === 7 && (
              <div className="p-5 border-t border-border">
                <label className="text-xs text-muted-foreground block mb-1">Responsibilities List (Comma separated or bullet points)</label>
                <textarea value={e.responsibilities_list || ''} onChange={ev => updateSlot('responsibilities_list', ev.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" />
              </div>
            )}
          </div>

          {/* 8. Application & Schedule */}
          <div className="border border-border rounded-2xl overflow-hidden bg-muted/20">
            <button type="button" onClick={() => toggleSection(8)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <span className="font-semibold text-sm text-foreground flex items-center gap-2"><Calendar className="w-4 h-4 text-pink-500" /> 8. Application & Schedule</span>
              {openSection === 8 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {openSection === 8 && (
              <div className="p-5 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground block mb-1">Application Start Date</label><input value={e.application_start_date || ''} onChange={ev => updateSlot('application_start_date', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Application Deadline</label><input value={e.application_deadline || ''} onChange={ev => updateSlot('application_deadline', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Event Date</label><input value={e.event_date || ''} onChange={ev => updateSlot('event_date', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Event Time</label><input value={e.event_time || ''} onChange={ev => updateSlot('event_time', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Venue</label><input value={e.venue || ''} onChange={ev => updateSlot('venue', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Application Instructions</label><input value={e.application_instructions || ''} onChange={ev => updateSlot('application_instructions', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div className="md:col-span-2"><label className="text-xs text-muted-foreground block mb-1">Important Notes</label><textarea value={e.important_notes || ''} onChange={ev => updateSlot('important_notes', ev.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
              </div>
            )}
          </div>

          {/* 9. Attachments & Resources */}
          <div className="border border-border rounded-2xl overflow-hidden bg-muted/20">
            <button type="button" onClick={() => toggleSection(9)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <span className="font-semibold text-sm text-foreground flex items-center gap-2"><Link2 className="w-4 h-4 text-emerald-500" /> 9. Attachments & Resources</span>
              {openSection === 9 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {openSection === 9 && (
              <div className="p-5 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground block mb-1">PDF Notice Upload / Link</label><input value={e.pdf_notice_upload || ''} onChange={ev => updateSlot('pdf_notice_upload', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Company Brochure Link</label><input value={e.company_brochure || ''} onChange={ev => updateSlot('company_brochure', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">JD PDF Upload / Link</label><input value={e.jd_pdf_upload || ''} onChange={ev => updateSlot('jd_pdf_upload', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Additional Documents Link</label><input value={e.additional_documents || ''} onChange={ev => updateSlot('additional_documents', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div className="md:col-span-2"><label className="text-xs text-muted-foreground block mb-1">Student Eligible List Upload / Link</label><input value={e.student_eligible_list_upload || ''} onChange={ev => updateSlot('student_eligible_list_upload', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
              </div>
            )}
          </div>

          {/* 10. Source Metadata / Admin Info */}
          <div className="border border-border rounded-2xl overflow-hidden bg-muted/20">
            <button type="button" onClick={() => toggleSection(10)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <span className="font-semibold text-sm text-foreground flex items-center gap-2"><Settings className="w-4 h-4 text-slate-500" /> 10. Source Metadata / Admin Info</span>
              {openSection === 10 ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {openSection === 10 && (
              <div className="p-5 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground block mb-1">Posted By</label><input value={e.posted_by || ''} onChange={ev => updateSlot('posted_by', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Institution / College Name</label><input value={e.institution_college_name || ''} onChange={ev => updateSlot('institution_college_name', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Source Type</label><input value={e.source_type || ''} onChange={ev => updateSlot('source_type', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Notice Date</label><input value={e.notice_date || ''} onChange={ev => updateSlot('notice_date', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Tags / Categories</label><input value={e.tags_categories || ''} onChange={ev => updateSlot('tags_categories', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Priority Level</label><input value={e.priority_level || ''} onChange={ev => updateSlot('priority_level', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
                <div><label className="text-xs text-muted-foreground block mb-1">Publish Status</label><input value={e.publish_status || ''} onChange={ev => updateSlot('publish_status', ev.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" /></div>
              </div>
            )}
          </div>
        </div>

        {/* Raw text pasted area */}
        <div className="pt-2">
          <label className="block text-sm font-medium text-foreground mb-2">
            Paste Full Raw Notice Text (Optional)
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            If you have the original WhatsApp notification or PDF copy/paste, drop the full notice body here:
          </p>
          <textarea
            value={form.content}
            onChange={(e) => setForm({...form, content: e.target.value})}
            rows={6}
            placeholder="e.g. Dear students, TCS is hiring 2026 Batch candidates. Last date to register is May 28..."
            className="w-full border border-border rounded-2xl p-4 bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
          />
        </div>

        <button
          onClick={submitContribution}
          disabled={submitting || !form.title.trim()}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-sm"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Submitting...' : 'Submit Notice Contribution'}
        </button>
      </div>
      )}
    </div>
  );
}

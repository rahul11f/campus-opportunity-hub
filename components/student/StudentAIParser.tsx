'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { 
  Bot, 
  Link as LinkIcon, 
  FileJson, 
  Image as ImageIcon, 
  FileText, 
  Loader2, 
  Wand2, 
  Upload, 
  ArrowUpRight,
  Send,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartExtractionPreview } from '@/components/admin/SmartExtractionPreview';

type ParseMethod = 'url' | 'json' | 'image' | 'text';

type StudentParserProps = {
  onContributionSubmitted?: () => void;
};

export function StudentAIParser({ onContributionSubmitted }: StudentParserProps) {
  const [method, setMethod] = useState<ParseMethod>('url');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Inputs
  const [url, setUrl] = useState('');
  const [json, setJson] = useState('');
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Preview Result
  const [result, setResult] = useState<any | null>(null);
  const [extractionStats, setExtractionStats] = useState<any | null>(null);
  const [selectedOpportunityIndex, setSelectedOpportunityIndex] = useState(0);

  const tabs = [
    { id: 'url', label: 'URL Fetch', icon: LinkIcon, desc: 'Paste notice link' },
    { id: 'json', label: 'Raw JSON', icon: FileJson, desc: 'Paste structured data' },
    { id: 'image', label: 'Flyer/Poster', icon: ImageIcon, desc: 'Upload drive flyer' },
    { id: 'text', label: 'Raw Text', icon: FileText, desc: 'Paste message forwards' },
  ] as const;

  async function handleParse() {
    try {
      setLoading(true);
      setResult(null);
      setSelectedOpportunityIndex(0);

      let payload = new FormData();
      payload.append('method', method);

      if (method === 'url') {
        if (!url) throw new Error('Please enter a URL');
        payload.append('content', url);
      } else if (method === 'json') {
        if (!json) throw new Error('Please paste JSON');
        try { JSON.parse(json); } catch (e) { throw new Error('Invalid JSON format'); }
        payload.append('content', json);
      } else if (method === 'text') {
        if (!text) throw new Error('Please paste some text');
        payload.append('content', text);
      } else if (method === 'image') {
        if (!imageFile) throw new Error('Please upload an image');
        payload.append('file', imageFile);
      }

      // Route parses content using the same server-side logic
      const res = await fetch('/api/parse', {
        method: 'POST',
        body: payload
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to parse');
      }

      const data = await res.json();
      setResult(data.opportunity);
      setExtractionStats(data.extraction_stats || null);
      toast.success('AI successfully analyzed your notice!');
    } catch (err: any) {
      toast.error(err.message || 'Parsing failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendForReview() {
    if (!result) return;
    
    try {
      setSubmitting(true);
      
      const opportunities = result.opportunities || [];
      const activeOpportunity = opportunities.length > 0 ? opportunities[selectedOpportunityIndex] : result;
      const companyName = activeOpportunity.basic_information?.company_name || 'AI Parsed Contribution';
      const roleName = activeOpportunity.job_details?.job_role || 'Opportunity';
      
      const res = await fetch('/api/student/contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `[AI Parsed] ${companyName} - ${roleName}`,
          contributionType: activeOpportunity.basic_information?.opportunity_type || 'placement',
          content: JSON.stringify(activeOpportunity, null, 2),
          sourceLink: activeOpportunity.basic_information?.jd_link || url || null,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Please sign in or create an account first to submit notice contributions.');
        }
        const data = await res.json();
        throw new Error(data.error || 'Submission failed');
      }

      toast.success('Your structured contribution has been submitted for Admin approval!');
      setResult(null);
      setExtractionStats(null);
      onContributionSubmitted?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit contribution');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMethod(tab.id as ParseMethod)}
            className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
              method === tab.id 
              ? 'bg-blue-50/50 border-blue-500 shadow-sm text-blue-900 dark:text-blue-200'
              : 'bg-white dark:bg-card border-border text-muted-foreground hover:bg-slate-50'
            }`}
          >
            <tab.icon className={`w-5 h-5 mb-2 relative z-10 ${method === tab.id ? 'text-blue-600' : ''}`} />
            <span className="text-xs font-bold relative z-10">{tab.label}</span>
            <span className="text-[9px] opacity-70 relative z-10">{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* Guide/Instruction */}
      <div className="rounded-xl bg-slate-50 dark:bg-muted/30 p-4 border border-border text-xs text-muted-foreground space-y-1.5">
        <p className="font-bold flex items-center gap-1.5 text-foreground">
          <HelpCircle className="w-3.5 h-3.5 text-blue-500" /> Guide: How to get the best extraction
        </p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Screenshots/Flyers:</strong> Upload high-resolution images. Make sure boxes, headings, and lists are readable.</li>
          <li><strong>URL Fetch:</strong> Use direct job description links or public Google Docs.</li>
          <li><strong>Text inputs:</strong> Keep the structure clean and retain contacts or dates.</li>
        </ul>
      </div>

      {/* Input */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={method}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {method === 'url' && (
              <>
                <label className="text-xs font-semibold text-muted-foreground">Target URL / Notice Link</label>
                <input 
                  type="url" 
                  placeholder="https://careers.company.com/job..."
                  className="w-full bg-muted/20 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-blue-500 transition-all text-sm"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                />
              </>
            )}

            {method === 'json' && (
              <>
                <label className="text-xs font-semibold text-muted-foreground">Paste Notice JSON</label>
                <textarea 
                  placeholder='{ "company": "Google", "role": "SWE" ... }'
                  className="w-full h-48 bg-muted/20 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-blue-500 transition-all font-mono text-xs"
                  value={json}
                  onChange={e => setJson(e.target.value)}
                />
              </>
            )}

            {method === 'text' && (
              <>
                <label className="text-xs font-semibold text-muted-foreground">Paste Full Notice Text</label>
                <textarea 
                  placeholder="Paste WhatsApp/Telegram forward containing company details, location, eligibility, package etc..."
                  className="w-full h-48 bg-muted/20 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-blue-500 transition-all text-xs"
                  value={text}
                  onChange={e => setText(e.target.value)}
                />
              </>
            )}

            {method === 'image' && (
              <>
                <label className="text-xs font-semibold text-muted-foreground">Upload flyer/poster screenshot</label>
                <div className="w-full h-48 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                  />
                  {imageFile ? (
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-foreground">{imageFile.name}</p>
                      <p className="text-[10px] text-muted-foreground">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs font-medium text-foreground">Click to upload screenshot</p>
                      <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG, JPEG up to 5MB</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 pt-4 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={handleParse}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50 text-xs shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {loading ? 'AI is analyzing notice...' : 'Parse Notice'}
          </button>
        </div>
      </div>

      {/* Output Preview */}
      {result && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <SmartExtractionPreview
            data={result}
            stats={extractionStats}
            selectedOpportunityIndex={selectedOpportunityIndex}
            onSelectOpportunity={setSelectedOpportunityIndex}
            onDataChange={setResult}
          />

          <button
            type="button"
            onClick={handleSendForReview}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors text-sm"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {submitting ? 'Submitting...' : 'Submit Extracted Drive Info for Admin Approval'}
          </button>
        </div>
      )}
    </div>
  );
}

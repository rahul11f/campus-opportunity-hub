'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Link as LinkIcon, FileJson, Image as ImageIcon, FileText, Loader2, Wand2, Upload, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { SmartExtractionPreview } from '@/components/admin/SmartExtractionPreview';

type ParseMethod = 'url' | 'json' | 'image' | 'text';

export default function AIParserDashboard() {
  const router = useRouter();
  const [method, setMethod] = useState<ParseMethod>('url');
  const [loading, setLoading] = useState(false);
  
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
    { id: 'url', label: 'URL Fetch', icon: LinkIcon, desc: 'Scrape job portals' },
    { id: 'json', label: 'Raw JSON', icon: FileJson, desc: 'Map structured data' },
    { id: 'image', label: 'Flyer/Poster', icon: ImageIcon, desc: 'OCR via AI' },
    { id: 'text', label: 'Raw Text', icon: FileText, desc: 'WhatsApp forwards' },
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
      toast.success('Successfully extracted structured data!');
    } catch (err: any) {
      toast.error(err.message || 'Parsing failed');
    } finally {
      setLoading(false);
    }
  }

  function handleSendToForm() {
    if (!result) return;
    const opportunities = result.opportunities || [];
    const activeOpp = opportunities.length > 0 ? opportunities[selectedOpportunityIndex] : result;
    const oppsToSave = opportunities.length > 0 ? opportunities : [result];
    
    localStorage.setItem('draft_opportunity', JSON.stringify(activeOpp));
    localStorage.setItem('draft_opportunities', JSON.stringify(oppsToSave));
    localStorage.setItem('draft_opportunity_index', String(selectedOpportunityIndex));
    router.push('/admin/new?draft=true');
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-transparent blur-3xl -z-10 rounded-full" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Parser Toolkit</h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-purple-600" />
              Extract perfectly typed data from any unstructured source
            </p>
          </div>
        </div>
      </motion.div>

      {/* Grid Layout */}
      <div className="grid lg:grid-cols-[1fr,400px] gap-8 items-start">
        {/* Left Col: Parser Controls */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          
          {/* Method Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setMethod(tab.id as ParseMethod)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                  method === tab.id 
                  ? 'bg-indigo-50 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)] text-indigo-900'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {method === tab.id && (
                  <motion.div layoutId="active-tab" className="absolute inset-0 bg-indigo-100 rounded-2xl" />
                )}
                <tab.icon className={`w-6 h-6 mb-2 relative z-10 ${method === tab.id ? 'text-indigo-600' : ''}`} />
                <span className="text-sm font-bold relative z-10">{tab.label}</span>
                <span className="text-[10px] opacity-70 relative z-10">{tab.desc}</span>
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xl">
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
                    <label className="text-sm font-semibold text-slate-700">Target URL</label>
                    <input 
                      type="url" 
                      placeholder="https://careers.company.com/job..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:bg-indigo-50/50 transition-all"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                    />
                  </>
                )}

                {method === 'json' && (
                  <>
                    <label className="text-sm font-semibold text-slate-700">Paste Raw JSON payload</label>
                    <textarea 
                      placeholder='{ "company": "Google", "role": "SWE" ... }'
                      className="w-full h-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:bg-indigo-50/50 transition-all font-mono text-sm"
                      value={json}
                      onChange={e => setJson(e.target.value)}
                    />
                  </>
                )}

                {method === 'text' && (
                  <>
                    <label className="text-sm font-semibold text-slate-700">Paste Unstructured Text</label>
                    <textarea 
                      placeholder="Hi everyone! Amazon is hiring SDE 1. Eligible branches: CSE, IT..."
                      className="w-full h-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:bg-indigo-50/50 transition-all text-sm"
                      value={text}
                      onChange={e => setText(e.target.value)}
                    />
                  </>
                )}

                {method === 'image' && (
                  <>
                    <label className="text-sm font-semibold text-slate-700">Upload Poster / Screenshot</label>
                    <div className="w-full h-64 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={e => setImageFile(e.target.files?.[0] || null)}
                      />
                      {imageFile ? (
                        <div className="text-center">
                          <ImageIcon className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
                          <p className="text-sm font-bold text-slate-900">{imageFile.name}</p>
                          <p className="text-xs text-slate-500">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                          <p className="text-sm font-medium text-slate-600">Drag & drop or click to upload</p>
                          <p className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleParse}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:shadow-none"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                {loading ? 'AI is analyzing...' : 'Extract Data'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Col: Output Preview */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-8 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl min-h-[400px] flex flex-col">
            {result ? (
              <>
                <SmartExtractionPreview
                  data={result}
                  stats={extractionStats}
                  selectedOpportunityIndex={selectedOpportunityIndex}
                  onSelectOpportunity={setSelectedOpportunityIndex}
                  onDataChange={setResult}
                />

                <button
                  onClick={handleSendToForm}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
                >
                  Review & Publish <ArrowUpRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-slate-400" />
                  Extracted Payload
                </h2>
                <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-4 overflow-y-auto max-h-[500px]">
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Bot className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">Awaiting input...</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

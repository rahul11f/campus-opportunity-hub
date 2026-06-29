'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Link as LinkIcon, FileJson, Image as ImageIcon, FileText, Loader2, Wand2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

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
      toast.success('Successfully extracted structured data!');
    } catch (err: any) {
      toast.error(err.message || 'Parsing failed');
    } finally {
      setLoading(false);
    }
  }

  function handleSendToForm() {
    if (!result) return;
    localStorage.setItem('draft_opportunity', JSON.stringify(result));
    router.push('/admin/new?draft=true');
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-transparent blur-3xl -z-10 rounded-full" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Parser Toolkit</h1>
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-purple-400" />
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
                  ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)] text-white'
                  : 'bg-background/40 border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'
                }`}
              >
                {method === tab.id && (
                  <motion.div layoutId="active-tab" className="absolute inset-0 bg-indigo-500/5 rounded-2xl" />
                )}
                <tab.icon className={`w-6 h-6 mb-2 relative z-10 ${method === tab.id ? 'text-indigo-400' : ''}`} />
                <span className="text-sm font-bold relative z-10">{tab.label}</span>
                <span className="text-[10px] opacity-70 relative z-10">{tab.desc}</span>
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="rounded-3xl border border-white/5 bg-background/50 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
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
                    <label className="text-sm font-semibold text-gray-300">Target URL</label>
                    <input 
                      type="url" 
                      placeholder="https://careers.company.com/job..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 focus:bg-indigo-500/5 transition-all"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                    />
                  </>
                )}

                {method === 'json' && (
                  <>
                    <label className="text-sm font-semibold text-gray-300">Paste Raw JSON payload</label>
                    <textarea 
                      placeholder="{ \"company\": \"Google\", \"role\": \"SWE\" ... }"
                      className="w-full h-64 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 focus:bg-indigo-500/5 transition-all font-mono text-sm"
                      value={json}
                      onChange={e => setJson(e.target.value)}
                    />
                  </>
                )}

                {method === 'text' && (
                  <>
                    <label className="text-sm font-semibold text-gray-300">Paste Unstructured Text</label>
                    <textarea 
                      placeholder="Hi everyone! Amazon is hiring SDE 1. Eligible branches: CSE, IT..."
                      className="w-full h-64 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 focus:bg-indigo-500/5 transition-all text-sm"
                      value={text}
                      onChange={e => setText(e.target.value)}
                    />
                  </>
                )}

                {method === 'image' && (
                  <>
                    <label className="text-sm font-semibold text-gray-300">Upload Poster / Screenshot</label>
                    <div className="w-full h-64 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={e => setImageFile(e.target.files?.[0] || null)}
                      />
                      {imageFile ? (
                        <div className="text-center">
                          <ImageIcon className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                          <p className="text-sm font-bold text-white">{imageFile.name}</p>
                          <p className="text-xs text-gray-400">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-300">Drag & drop or click to upload</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
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
          <div className="rounded-3xl border border-white/5 bg-background/50 backdrop-blur-xl p-6 shadow-2xl min-h-[400px] flex flex-col">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileJson className="w-5 h-5 text-gray-400" />
              Extracted Payload
            </h2>
            
            <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-4 overflow-y-auto max-h-[500px]">
              {result ? (
                <pre className="text-xs font-mono text-emerald-400/90 whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <Bot className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">Awaiting input...</p>
                </div>
              )}
            </div>

            {result && (
              <button
                onClick={handleSendToForm}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors"
              >
                Review & Publish <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

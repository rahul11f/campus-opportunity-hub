'use client';

import { useRef, useState } from 'react';
import {
  Upload,
  FileImage,
  FileText,
  Loader2,
} from 'lucide-react';
import { PasteWorkflow } from '@/components/admin/PasteWorkflow';
import { OpportunityForm } from '@/components/admin/OpportunityForm';
import { extractTextFromImage } from '@/lib/client/ocr';
import type {
  ExtractedOpportunity,
  OpportunityType,
} from '@/types/opportunity';
import { toast } from 'sonner';

const emptyData: Partial<ExtractedOpportunity> = {
  company: '',
  role: '',
  type: 'placement',
  salary: '',
  location: '',
  apply_link: '',
  instructions: '',
  deadline: null,
  tags: [],
  skills: [],
  responsibilities: [],
  eligibility: {
    branches: [],
    cgpa: '',
    backlog: '',
    batch: '',
    other: '',
  },
  interview_process: {
    rounds: null,
    description: [],
  },
};

function parseStructuredText(
  input: string
): Partial<ExtractedOpportunity> {
  const get = (label: string) => {
    const regex = new RegExp(
      `${label}\\s*[:\\-]\\s*(.+)`,
      'i'
    );

    return input.match(regex)?.[1]?.trim() || '';
  };

  const branches = get('Branches')
    .split(/,|\/|and/i)
    .map((x) => x.trim())
    .filter(Boolean);

  const rawType = get('Type').toLowerCase();

  const validTypes: OpportunityType[] = [
    'placement',
    'internship',
    'hackathon',
    'scholarship',
    'campus_drive',
    'fellowship',
    'competition',
    'other',
  ];

  const type = validTypes.includes(
    rawType as OpportunityType
  )
    ? (rawType as OpportunityType)
    : 'placement';

  return {
    company: get('Company') || 'Manual Review Required',
    role: get('Role') || 'Opportunity Listing',
    type,
    salary: get('Salary') || null,
    location: get('Location') || null,
    apply_link: get('Apply Link') || null,
    deadline: get('Deadline') || null,
    instructions: get('Instructions') || input,
    tags: [],
    skills: [],
    responsibilities: [],
    confidence_score: 0.8,
    eligibility: {
      branches,
      cgpa: get('CGPA') || null,
      backlog: get('Backlog') || null,
      batch: get('Batch') || null,
      other: null,
    },
    interview_process: {
      rounds: null,
      description: [],
    },
  };
}

export default function AdminNewPage() {
  const [mode, setMode] = useState<
    'ai' | 'manual' | 'text' | 'json' | 'upload'
  >('ai');

  const [jsonInput, setJsonInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [importedData, setImportedData] =
    useState<Partial<ExtractedOpportunity> | null>(null);

  const [uploading, setUploading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function importJson() {
    try {
      const parsed = JSON.parse(jsonInput);
      setImportedData(parsed);
      toast.success('JSON imported successfully');
    } catch {
      toast.error('Invalid JSON');
    }
  }

  function importText() {
    try {
      const parsed = parseStructuredText(textInput);
      setImportedData(parsed);
      toast.success('Structured text imported');
    } catch {
      toast.error('Could not parse text');
    }
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setImportedData(null);
    setOcrStatus('');

    try {
      const isImage = file.type.startsWith('image/');

      if (isImage) {
        const rawText = await extractTextFromImage(
          file,
          setOcrStatus
        );

        if (!rawText.trim()) {
          throw new Error('No text detected in image');
        }

        const res = await fetch('/api/process-notice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rawText }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(
            data?.error || 'AI processing failed'
          );
        }

        setImportedData(
          data.extracted || {
            company: 'Manual Review Required',
            role: 'Opportunity Listing',
            instructions: rawText,
          }
        );

        toast.success('Image OCR processed successfully');
      } else {
        const fd = new FormData();
        fd.append('file', file);

        const res = await fetch('/api/admin/import-file', {
          method: 'POST',
          body: fd,
        });

        const data = await res.json();
        console.log('PROCESS NOTICE RESPONSE', data);

        if (!res.ok) {
          throw new Error(data?.error || 'Upload failed');
        }

        setImportedData(data.extracted);
        toast.success('File processed successfully');
      }
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : 'Upload failed'
      );
    } finally {
      setUploading(false);
      setOcrStatus('');
    }
  }

  const tabs = [
    { key: 'ai', label: 'AI Extract' },
    { key: 'upload', label: 'Upload File' },
    { key: 'manual', label: 'Manual Create' },
    { key: 'text', label: 'Import Text' },
    { key: 'json', label: 'Import JSON' },
  ] as const;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Publishing Cockpit
        </h1>

        <p className="text-muted-foreground mt-2">
          Create listings using AI extraction,
          uploads, manual entry, structured text,
          or JSON import.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setMode(tab.key);
              setImportedData(null);
            }}
            className={`px-5 py-3 rounded-xl border transition-colors ${mode === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === 'ai' && (
        <div className="bg-card border rounded-2xl p-6">
          <PasteWorkflow />
        </div>
      )}

      {mode === 'manual' && (
        <div className="bg-card border rounded-2xl p-6">
          <OpportunityForm initialData={emptyData} />
        </div>
      )}

      {mode === 'upload' && (
        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-3">
              Upload Notice Files
            </h2>

            <p className="text-muted-foreground mb-6">
              Upload PDF notices, screenshots,
              WhatsApp messages, Telegram images,
              or placement circulars.
            </p>

            <input
              ref={fileRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadFile(file);
              }}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);

                const file = e.dataTransfer.files?.[0];

                if (file) uploadFile(file);
              }}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary'
                }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <p>{ocrStatus || 'Processing upload...'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 mx-auto text-primary" />

                  <div>
                    <p className="font-semibold">
                      Drag & drop files here
                    </p>

                    <p className="text-sm text-muted-foreground mt-2">
                      or click to upload
                    </p>
                  </div>

                  <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      PDF
                    </span>

                    <span className="flex items-center gap-2">
                      <FileImage className="w-4 h-4" />
                      Images
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {importedData && (
            <div className="bg-card border rounded-2xl p-6">
              <OpportunityForm initialData={importedData} />
            </div>
          )}
        </div>
      )}

      {mode === 'text' && (
        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-6">
            <textarea
              rows={14}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full border rounded-xl p-4"
              placeholder="Paste structured AI text..."
            />

            <button
              onClick={importText}
              className="mt-4 px-5 py-3 rounded-xl bg-primary text-primary-foreground"
            >
              Import Text
            </button>
          </div>

          {importedData && (
            <div className="bg-card border rounded-2xl p-6">
              <OpportunityForm initialData={importedData} />
            </div>
          )}
        </div>
      )}

      {mode === 'json' && (
        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-6">
            <textarea
              rows={14}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full border rounded-xl p-4 font-mono"
              placeholder="Paste JSON..."
            />

            <button
              onClick={importJson}
              className="mt-4 px-5 py-3 rounded-xl bg-primary text-primary-foreground"
            >
              Import JSON
            </button>
          </div>

          {importedData && (
            <div className="bg-card border rounded-2xl p-6">
              <OpportunityForm initialData={importedData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

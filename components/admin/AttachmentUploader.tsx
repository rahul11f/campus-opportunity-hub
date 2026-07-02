'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Upload, Paperclip, Trash2, FileText, Download, X } from 'lucide-react';

import type { AttachmentItem } from '@/types/opportunity';

const FILE_TYPE_OPTIONS = [
  { value: 'pdf', label: 'PDF Document' },
  { value: 'eligibility_list', label: 'Eligibility List (Excel/CSV)' },
  { value: 'document', label: 'Other Document' },
];

export function AttachmentUploader({
  opportunityId,
  attachments = [],
  onAttachmentsChange,
}: {
  opportunityId: string;
  attachments: AttachmentItem[];
  onAttachmentsChange?: (attachments: AttachmentItem[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [fileType, setFileType] = useState('pdf');
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleUpload(file: File) {
    try {
      setUploading(true);

      const fd = new FormData();
      fd.append('file', file);
      fd.append('opportunityId', opportunityId);
      fd.append('fileType', fileType);

      const res = await fetch('/api/admin/upload-attachment', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      toast.success(`Uploaded: ${file.name}`);

      if (onAttachmentsChange && data.attachment) {
        onAttachmentsChange([...attachments, data.attachment]);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(publicId: string) {
    try {
      setDeleting(publicId);

      const res = await fetch('/api/admin/delete-attachment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId, publicId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Delete failed');
      }

      toast.success('Attachment deleted');

      if (onAttachmentsChange) {
        onAttachmentsChange(attachments.filter((a) => a.public_id !== publicId));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(null);
    }
  }

  const fileTypeIcons: Record<string, string> = {
    pdf: '📄',
    eligibility_list: '📊',
    document: '📝',
    image: '🖼️',
    other: '📎',
  };

  return (
    <div className="rounded-2xl border border-border p-5 space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Paperclip className="w-4 h-4 text-primary" />
        Attachments
      </h3>

      {/* Existing Attachments */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((att) => (
            <div
              key={att.public_id}
              className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <span className="text-lg shrink-0">
                {fileTypeIcons[att.file_type] || '📎'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{att.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {att.file_type?.replace('_', ' ')}
                  {att.file_size ? ` • ${(att.file_size / 1024).toFixed(0)} KB` : ''}
                </p>
              </div>
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors shrink-0"
              >
                <Download className="w-3 h-3" />
                View
              </a>
              <button
                onClick={() => handleDelete(att.public_id)}
                disabled={deleting === att.public_id}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50 shrink-0"
              >
                {deleting === att.public_id ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Section */}
      <div className="border-t border-border pt-4 space-y-3">
        <div className="flex items-center gap-3">
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:border-primary"
          >
            {FILE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <label className="flex-1">
            <input
              type="file"
              accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = '';
              }}
              disabled={uploading}
            />
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all text-sm font-medium text-muted-foreground hover:text-foreground">
              {uploading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Choose file to upload
                </>
              )}
            </div>
          </label>
        </div>

        <p className="text-[10px] text-muted-foreground">
          Supported: PDF, Excel, CSV, Word, Images. Max 10MB.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function EligibilityUploader({
  opportunityId,
  collegeId,
}: {
  opportunityId: string;
  collegeId?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');

  async function upload(file: File) {
    try {
      setUploading(true);

      const fd = new FormData();
      fd.append('file', file);
      fd.append('opportunityId', opportunityId);

      if (collegeId) {
        fd.append('collegeId', collegeId);
      }

      const res = await fetch('/api/admin/import-eligibility', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success(`${data.imported} students imported`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Upload failed'
      );
    } finally {
      setUploading(false);
    }
  }

  async function importGoogleSheet() {
    try {
      setUploading(true);

      const res = await fetch('/api/admin/import-google-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheetUrl,
          opportunityId,
          collegeId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success(
        `${data.imported} students imported from Google Sheet`
      );

      setSheetUrl('');
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Google Sheet import failed'
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="border rounded-2xl p-5 mt-6 space-y-4">
      <h3 className="font-semibold">
        Eligibility Import
      </h3>

      <div>
        <p className="text-sm mb-2">
          Upload Excel / CSV
        </p>

        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
      </div>

      <div className="border-t pt-4">
        <p className="text-sm mb-2">
          Import from Google Sheet
        </p>

        <input
          type="text"
          value={sheetUrl}
          onChange={(e) => setSheetUrl(e.target.value)}
          placeholder="Paste public Google Sheet URL"
          className="w-full border rounded-xl px-4 py-2"
        />

        <button
          onClick={importGoogleSheet}
          disabled={uploading || !sheetUrl}
          className="mt-3 px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
        >
          Import Google Sheet
        </button>
      </div>

      {uploading && (
        <p className="text-sm">
          Importing...
        </p>
      )}
    </div>
  );
}

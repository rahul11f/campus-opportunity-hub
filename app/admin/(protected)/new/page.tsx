import { Metadata } from 'next';
import { PasteWorkflow } from '@/components/admin/PasteWorkflow';

export const metadata: Metadata = { title: 'New Listing | Admin' };

export default function AdminNewPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">New Listing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste a raw Telegram/WhatsApp notice and let AI extract the structured data automatically.
        </p>
      </div>
      <PasteWorkflow />
    </div>
  );
}


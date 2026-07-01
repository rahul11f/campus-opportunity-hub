'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  ClipboardPaste,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCcw,
  Link2,
  Brain,
} from 'lucide-react';
import { OpportunityForm } from './OpportunityForm';
import {
  ExtractedOpportunity,
  DetectedUrl,
  AdditionalInfoItem,
} from '@/types/opportunity';

type ProcessResponse = {
  success: boolean;
  detectedUrls: DetectedUrl[];
  extracted: (ExtractedOpportunity & { additional_extracted_info?: AdditionalInfoItem[] }) | null;
  extractionError: string | null;
  cleanedText: string;
  extractionStats?: {
    populated_sections: string[];
    populated_field_count: number;
    additional_info_count: number;
  };
  diagnostics?: {
    urlCount: number;
    fetchedCount: number;
    loginRequiredCount: number;
    errorCount: number;
    rawReductionPercent: number;
  };
};

function getBestSourceLink(urls: DetectedUrl[]): string | null {
  const fetched = urls.find(
    (u) =>
      u.status === 'fetched' &&
      !!u.resolvedUrl
  );

  if (fetched?.resolvedUrl) {
    return fetched.resolvedUrl;
  }

  const fallback = urls.find(
    (u) =>
      !!u.resolvedUrl || !!u.originalUrl
  );

  return fallback?.resolvedUrl || fallback?.originalUrl || null;
}

function ConfidenceBanner({
  confidence,
}: {
  confidence: number;
}) {
  if (confidence >= 0.8) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        High-confidence extraction ({Math.round(confidence * 100)}%)
      </div>
    );
  }

  if (confidence >= 0.5) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Medium-confidence extraction ({Math.round(confidence * 100)}%) — review carefully.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      Low-confidence extraction ({Math.round(confidence * 100)}%) — manual verification strongly recommended.
    </div>
  );
}

export function PasteWorkflow() {
  const [rawText, setRawText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] =
    useState<ExtractedOpportunity | null>(null);
  const [fallbackDraft, setFallbackDraft] =
    useState<Partial<ExtractedOpportunity> | null>(null);
  const [detectedUrls, setDetectedUrls] =
    useState<DetectedUrl[]>([]);
  const [cleanedText, setCleanedText] =
    useState('');
  const [diagnostics, setDiagnostics] =
    useState<ProcessResponse['diagnostics']>();
  const [extractionError, setExtractionError] =
    useState<string | null>(null);
  const [additionalInfoItems, setAdditionalInfoItems] =
    useState<AdditionalInfoItem[]>([]);
  const [extractionStats, setExtractionStats] =
    useState<ProcessResponse['extractionStats']>();
  const [selectedOppIndex, setSelectedOppIndex] = useState(0);

  async function processNotice() {
    if (!rawText.trim()) {
      toast.error('Paste a notice first.');
      return;
    }

    if (rawText.trim().length < 10) {
      toast.error('Notice text is too short.');
      return;
    }

    setProcessing(true);
    setExtractionError(null);
    setExtractedData(null);
    setFallbackDraft(null);
    setDetectedUrls([]);
    setDiagnostics(undefined);
    setAdditionalInfoItems([]);
    setExtractionStats(undefined);
    setSelectedOppIndex(0);

    try {
      const res = await fetch('/api/process-notice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawText,
        }),
      });

      const data: ProcessResponse =
        await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          (data as any)?.error ||
            'Processing failed'
        );
      }

      setDetectedUrls(data.detectedUrls || []);
      setExtractionError(data.extractionError);
      setCleanedText(data.cleanedText);
      setDiagnostics(data.diagnostics);

      if (data.extracted) {
        const rootObj = data.extracted as any;
        if (rootObj.opportunities && Array.isArray(rootObj.opportunities)) {
          setExtractedData(rootObj);
          setAdditionalInfoItems(rootObj.opportunities[0]?.additional_extracted_info || []);
        } else {
          setExtractedData({ opportunities: [data.extracted] } as any);
          setAdditionalInfoItems(data.extracted.additional_extracted_info || []);
        }
        setFallbackDraft(null);
      } else {
        const fallback: Partial<ExtractedOpportunity> = {
          company: 'Manual Review Required',
          role: 'Opportunity Listing',
          type: 'placement',
          instructions: data.cleanedText || rawText,
          apply_link:
            getBestSourceLink(data.detectedUrls || []) || '',
        };

        setExtractedData({ opportunities: [fallback as any] } as any);
        setFallbackDraft(fallback);
      }

      if (data.extracted) {
        toast.success(
          'Opportunity extracted. Review before publishing.'
        );
      } else {
        toast.warning(
          'Extraction completed but AI could not structure the notice.'
        );
      }

      if (data.extractionStats) {
        setExtractionStats(data.extractionStats);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Processing failed'
      );
    } finally {
      setProcessing(false);
    }
  }

  const sourceLink =
    getBestSourceLink(detectedUrls);

  const opportunitiesList = (extractedData as any)?.opportunities || [];
  const reviewData = opportunitiesList[selectedOppIndex] || fallbackDraft;

  // Sync additionalInfoItems when tab changes
  const activeAdditionalInfo = reviewData?.additional_extracted_info || [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardPaste className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">
            Paste Opportunity Notice
          </h2>
        </div>

        <textarea
          value={rawText}
          onChange={(e) =>
            setRawText(e.target.value)
          }
          placeholder="Paste placement notice, internship announcement, recruitment circular, Telegram message, or opportunity text here..."
          rows={12}
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">
            Supports URLs, PDFs, image links, Telegram posts, and web notices.
          </p>

          <button
            onClick={processNotice}
            disabled={processing}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Process Notice
              </>
            )}
          </button>
        </div>
      </div>

      {(diagnostics || detectedUrls.length > 0) && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">
              Processing Diagnostics
            </h3>
          </div>

          {diagnostics && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
              <StatCard
                label="URLs"
                value={diagnostics.urlCount}
              />
              <StatCard
                label="Fetched"
                value={diagnostics.fetchedCount}
              />
              <StatCard
                label="Login Required"
                value={
                  diagnostics.loginRequiredCount
                }
              />
              <StatCard
                label="Errors"
                value={diagnostics.errorCount}
              />
              <StatCard
                label="Cleanup"
                value={`${diagnostics.rawReductionPercent}%`}
              />
            </div>
          )}

          <div className="space-y-3">
            {detectedUrls.map((url) => (
              <div
                key={url.originalUrl}
                className="rounded-xl border border-border p-3 text-sm"
              >
                <div className="font-medium break-all">
                  {url.resolvedUrl ||
                    url.originalUrl}
                </div>

                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <Badge>{url.type}</Badge>
                  <Badge>{url.status}</Badge>
                  {url.error && (
                    <Badge danger>
                      {url.error}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {extractionError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-700">
                Extraction issue
              </h3>
              <p className="text-sm text-red-600 mt-1">
                AI extraction unavailable. Manual draft prepared for review.
              </p>

              <button
                onClick={processNotice}
                disabled={processing}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
              >
                <RefreshCcw className="w-4 h-4" />
                Reprocess
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewData && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">
              Review Before Publish
            </h3>
          </div>

          <ConfidenceBanner
            confidence={
              reviewData?.confidence_score ?? 0
            }
          />

          {extractionStats && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
              Extracted <strong>{extractionStats.populated_field_count}</strong> fields across{' '}
              <strong>{extractionStats.populated_sections.length}</strong> sections
              {extractionStats.additional_info_count > 0 && (
                <> + <strong>{extractionStats.additional_info_count}</strong> additional details</>    
              )}
            </div>
          )}

          {opportunitiesList.length > 1 && (
            <div className="flex flex-wrap gap-1 border-b border-border pb-1">
              {opportunitiesList.map((opp: any, idx: number) => {
                const companyName = opp.basic_information?.company_name || `Company ${idx + 1}`;
                const isSelected = selectedOppIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedOppIndex(idx);
                    }}
                    className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                      isSelected
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {companyName}
                  </button>
                );
              })}
            </div>
          )}

          <OpportunityForm
            key={selectedOppIndex}
            initialData={reviewData}
            rawText={cleanedText || rawText}
            sourceLink={sourceLink}
            additionalInfo={activeAdditionalInfo}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="text-xs text-muted-foreground">
        {label}
      </div>
      <div className="text-lg font-semibold mt-1">
        {value}
      </div>
    </div>
  );
}

function Badge({
  children,
  danger = false,
}: {
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <span
      className={`rounded-lg px-2 py-1 ${
        danger
          ? 'bg-red-100 text-red-700'
          : 'bg-secondary text-secondary-foreground'
      }`}
    >
      {children}
    </span>
  );
}


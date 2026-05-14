import { AlertCircle, ExternalLink } from 'lucide-react';

interface DisclaimerProps {
  sourceLink?: string | null;
}

export function Disclaimer({ sourceLink }: DisclaimerProps) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex gap-3">
        <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Disclaimer:</span>{' '}
            Campus Opportunity Hub is an independent informational platform run by students, 
            for students. We are not affiliated with any company or institution listed here. 
            All opportunity details are extracted from publicly shared campus notices and 
            summarized for convenience. Students must verify all critical information — including 
            deadlines, eligibility, and application procedures — directly from official sources 
            before applying. We assume no responsibility for inaccuracies.
          </p>
          {sourceLink && (
            <a
              href={sourceLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View Original Notice Source
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

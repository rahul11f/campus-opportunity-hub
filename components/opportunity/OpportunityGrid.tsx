import { Opportunity } from '@/types/opportunity';
import { OpportunityCard, OpportunityCardSkeleton } from './OpportunityCard';
import { AdSlot } from '@/components/ads/AdSlot';

interface OpportunityGridProps {
  opportunities: Opportunity[];
  showAds?: boolean;
}

export function OpportunityGrid({
  opportunities,
  showAds = true,
}: OpportunityGridProps) {
  if (!opportunities.length) {
    return (
      <div className="text-center py-20 col-span-full">
        <div className="text-5xl mb-4">🎓</div>
        <h3 className="text-xl font-semibold">
          No opportunities found
        </h3>
        <p className="text-muted-foreground mt-2">
          Try different filters.
        </p>
      </div>
    );
  }

  const items: React.ReactNode[] = [];

  opportunities.forEach((opp, i) => {
    items.push(
      <OpportunityCard key={opp.id} opportunity={opp} />
    );

    if (showAds && (i + 1) % 6 === 0) {
      items.push(
        <div key={`ad-${i}`} className="col-span-full md:hidden">
          <AdSlot position="in-feed" />
        </div>
      );
    }
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {items}
    </div>
  );
}

export function OpportunityGridSkeleton({
  count = 6,
}: {
  count?: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <OpportunityCardSkeleton key={i} />
      ))}
    </div>
  );
}
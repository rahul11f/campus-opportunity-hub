import { Opportunity } from '@/types/opportunity';
import { OpportunityCard, OpportunityCardSkeleton } from './OpportunityCard';
import { AdSlot } from '@/components/ads/AdSlot';

interface OpportunityGridProps {
  opportunities: Opportunity[];
  showAds?: boolean;
}

export function OpportunityGrid({ opportunities, showAds = true }: OpportunityGridProps) {
  if (opportunities.length === 0) {
    return (
      <div className="text-center py-16 col-span-full">
        <div className="text-5xl mb-4">🎓</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No opportunities found</h3>
        <p className="text-muted-foreground text-sm">
          Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  const items: React.ReactNode[] = [];

  opportunities.forEach((opp, i) => {
    items.push(<OpportunityCard key={opp.id} opportunity={opp} index={i} />);

    // Insert in-feed ad every 6 cards on mobile
    if (showAds && (i + 1) % 6 === 0 && i < opportunities.length - 1) {
      items.push(
        <div key={`ad-${i}`} className="md:hidden col-span-full">
          <AdSlot position="in-feed" />
        </div>
      );
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items}
    </div>
  );
}

export function OpportunityGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <OpportunityCardSkeleton key={i} />
      ))}
    </div>
  );
}

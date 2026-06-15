import { Modal } from '@/components/shared/Modal';
import OpportunityPage from '../../../opportunities/[id]/page';

export default async function InterceptedOpportunityPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Modal>
      <div className="pt-2">
        <OpportunityPage params={params} />
      </div>
    </Modal>
  );
}

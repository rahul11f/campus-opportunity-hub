import { Construction } from 'lucide-react';

export default function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="p-6">
      <div className="flex items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
        </div>
      </div>

      <div className="admin-card rounded-xl p-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
          <Construction className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Coming Soon</h2>
        <p className="text-gray-400 text-sm max-w-sm">
          The <strong className="text-white">{title}</strong> module is under active development and will be available soon.
        </p>
      </div>
    </div>
  );
}

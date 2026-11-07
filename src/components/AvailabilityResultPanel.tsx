import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { AvailabilityResult, AvailabilityStatus } from '@/domain/availability';

/** One mapping from status to presentation (replaces five repeated ternaries). */
const STATUS_VIEW: Record<
  AvailabilityStatus,
  { label: string; Icon: typeof CheckCircle2; box: string; icon: string; title: string; text: string }
> = {
  available: {
    label: 'Available',
    Icon: CheckCircle2,
    box: 'border-green-200 bg-green-50',
    icon: 'text-green-600',
    title: 'text-green-800',
    text: 'text-green-700',
  },
  unavailable: {
    label: 'Unavailable',
    Icon: XCircle,
    box: 'border-red-200 bg-red-50',
    icon: 'text-red-600',
    title: 'text-red-800',
    text: 'text-red-700',
  },
};

interface AvailabilityResultPanelProps {
  roomName: string;
  result: AvailabilityResult | null;
}

/** Live region is always mounted so screen readers announce new results. */
export default function AvailabilityResultPanel({ roomName, result }: AvailabilityResultPanelProps) {
  const view = result ? STATUS_VIEW[result.status] : null;

  return (
    <div role="status" aria-live="polite" aria-atomic="true" data-testid="result">
      {result && view && (
        <div className={`rounded-xl border-2 p-4 ${view.box}`}>
          <div className="flex items-start gap-3">
            <view.Icon className={`flex-shrink-0 mt-0.5 ${view.icon}`} size={22} strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className={`text-base font-bold ${view.title}`}>{view.label}</p>
              <p className={`text-xs font-medium mt-0.5 ${view.text}`}>{roomName}</p>
              <p className={`text-sm mt-1 ${view.text}`}>{result.reason}</p>
              {result.errors.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {result.errors.map((err) => (
                    <li key={err} className="flex items-start gap-1.5 text-xs text-red-600">
                      <AlertTriangle size={12} strokeWidth={2} className="flex-shrink-0 mt-0.5" />
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

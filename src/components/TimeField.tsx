import { DAY_END } from '@/domain/availability';
import { formatTime, isDisplayableTime, parseMinutes } from '@/lib/time';

interface TimeFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

/** One whole-minute time input with an HH:MM hint. Used for both start and end. */
export default function TimeField({ id, label, value, placeholder, onChange }: TimeFieldProps) {
  const minutes = parseMinutes(value);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={0}
        max={DAY_END}
        step={1}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      />
      {isDisplayableTime(minutes) && (
        <p className="mt-1 text-xs text-gray-400">{formatTime(minutes)}</p>
      )}
    </div>
  );
}

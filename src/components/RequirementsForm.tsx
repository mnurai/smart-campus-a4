import { Users } from 'lucide-react';
import { EQUIPMENT, type Equipment } from '@/domain/types';

interface RequirementsFormProps {
  attendeesInput: string;
  attendeesError: string | null;
  equipment: readonly Equipment[];
  onAttendeesChange: (value: string) => void;
  onToggleEquipment: (item: Equipment) => void;
}

export default function RequirementsForm({
  attendeesInput,
  attendeesError,
  equipment,
  onAttendeesChange,
  onToggleEquipment,
}: RequirementsFormProps) {
  return (
    <section aria-labelledby="requirements-heading" className="space-y-4">
      <h2 id="requirements-heading" className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
        1. Your requirements
      </h2>

      <div>
        <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 mb-1.5">
          Number of attendees
        </label>
        <div className="relative">
          <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="attendees"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={attendeesInput}
            onChange={(e) => onAttendeesChange(e.target.value)}
            aria-invalid={attendeesError !== null}
            aria-describedby={attendeesError ? 'attendees-error' : undefined}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        {attendeesError && (
          <p id="attendees-error" className="mt-1 text-xs text-red-600">
            {attendeesError}
          </p>
        )}
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">Required equipment</legend>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT.map((item) => {
            const checked = equipment.includes(item);
            return (
              <label
                key={item}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer select-none transition ${
                  checked
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleEquipment(item)}
                  className="accent-blue-600"
                />
                {item}
              </label>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}

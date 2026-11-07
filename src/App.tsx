import { GraduationCap } from 'lucide-react';
import RoomFinder from '@/components/RoomFinder';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white">
            <GraduationCap size={20} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">Smart Campus</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Room Availability Checker</p>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-8 sm:py-12">
        <RoomFinder />
      </main>
    </div>
  );
}

export default App;

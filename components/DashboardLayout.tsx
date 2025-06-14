'use client';

import { ReactNode } from 'react';
import { Home, MapPin, Users, Flame, Settings } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const router = useRouter();
  const { id: studentId } = useParams();

  const goTo = (path: string) => {
    if (!studentId) return;
    router.push(`/dashboard/${studentId}/${path}`);
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-20 flex flex-col items-center justify-center space-y-6">
        <button className="text-white hover:bg-gray-800 p-3 rounded-xl" title="Overview" onClick={() => goTo('overview')}>
          <Home size={24} />
        </button>
        <button className="text-white hover:bg-gray-800 p-3 rounded-xl" title="Places" onClick={() => goTo('places')}>
          <MapPin size={24} />
        </button>
        <button className="text-white hover:bg-gray-800 p-3 rounded-xl" title="Clubs" onClick={() => goTo('clubs')}>
          <Users size={24} />
        </button>
        <button className="text-white hover:bg-gray-800 p-3 rounded-xl" title="Freshers" onClick={() => goTo('freshers')}>
          <Flame size={24} />
        </button>
        <button className="text-white hover:bg-gray-800 p-3 rounded-xl" title="Settings" onClick={() => goTo('settings')}>
          <Settings size={24} />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="bg-white rounded-3xl shadow-2xl w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
}

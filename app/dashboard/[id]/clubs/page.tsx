'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Clubs() {
  const { id: studentId } = useParams();

  return (
    <DashboardLayout>
      <div
        className="relative w-full h-screen bg-cover bg-center rounded-2xl overflow-hidden"
        style={{ backgroundImage: "url('/images/club_main.jpg')" }}
      >
        {/* Centered Club Circles */}
        <div className="absolute inset-0 flex justify-center items-center gap-16 flex-wrap p-4">
          {/* Science Club */}
          <Link
            href={`/dashboard/${studentId}/clubs/science`}
            className="flex flex-col items-center group"
          >
            <div className="w-70 h-70 rounded-full overflow-hidden border-4 border-white group-hover:border-blue-400 shadow-lg transition">
              <img
                src="/images/clubs/science.jpg"
                alt="Science Clubs"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="mt-2 text-white text-lg font-semibold group-hover:text-blue-300 transition">
              Science Clubs
            </span>
          </Link>

          {/* Cultural Club */}
          <Link
            href={`/dashboard/${studentId}/clubs/cultural`}
            className="flex flex-col items-center group"
          >
            <div className="w-70 h-70 rounded-full overflow-hidden border-4 border-white group-hover:border-pink-400 shadow-lg transition">
              <img
                src="/images/clubs/cultural.jpg"
                alt="Cultural Clubs"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="mt-2 text-white text-lg font-semibold group-hover:text-pink-300 transition">
              Cultural Clubs
            </span>
          </Link>

          {/* Welfare Club */}
          <Link
            href={`/dashboard/${studentId}/clubs/welfare`}
            className="flex flex-col items-center group"
          >
            <div className="w-70 h-70 rounded-full overflow-hidden border-4 border-white group-hover:border-green-400 shadow-lg transition">
              <img
                src="/images/clubs/welfare.jpg"
                alt="Welfare Clubs"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="mt-2 text-white text-lg font-semibold group-hover:text-green-300 transition">
              Welfare Clubs
            </span>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

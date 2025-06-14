'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PlacesPage() {
  const { id: studentId } = useParams();

  return (
    <DashboardLayout>
      <div
        className="relative w-full h-full bg-cover bg-center rounded-2xl overflow-hidden"
        style={{ backgroundImage: "url('/images/iiser.jpg')" }}
      >
        {/* Main Gate */}
        <Link href={`/dashboard/${studentId}/places/main`} className="absolute top-[52%] left-[24%] px-2 py-1 bg-white/80 rounded-md text-sm text-gray-800">
          #MAIN GATE
        </Link>

        {/* Indoor Stadium */}
        <Link href={`/dashboard/${studentId}/places/indoor`} className="absolute top-[60%] left-[30%] px-2 py-1 bg-white/80 rounded-md text-sm hover:bg-white text-gray-800">
          #Indoor Stadium Area
        </Link>

        {/* Mess */}
        <Link href={`/dashboard/${studentId}/places/mess`} className="absolute top-[77%] left-[45%] px-2 py-1 bg-white/80 rounded-md text-sm hover:bg-white text-gray-800">
          #CDH1
        </Link>

        {/* Anamudi Block */}
        <Link href={`/dashboard/${studentId}/places/anamudi`} className="absolute top-[73%] left-[45%] px-2 py-1 bg-white/80 rounded-md text-sm text-gray-800">
          #Anamudi block
        </Link>

        {/* PHD Hostels */}
        <Link href={`/dashboard/${studentId}/places/phd-hostels`} className="absolute top-[42%] left-[53%] px-2 py-1 bg-white/80 rounded-md text-sm text-gray-800">
          #PHD hostels
        </Link>

        <Link href={`/dashboard/${studentId}/places/cdh2`} className="absolute top-[36%] left-[57%] px-2 py-1 bg-white/80 rounded-md text-sm text-gray-800">
          #CDH2
        </Link>

        {/* Cake World */}
        <Link href={`/dashboard/${studentId}/places/cake-world`} className="absolute top-[24%] left-[52%] px-2 py-1 bg-white/80 rounded-md text-sm text-gray-800">
          #Cake World
        </Link>

        {/* Tasty */}
        <Link href={`/dashboard/${studentId}/places/tasty`} className="absolute top-[27%] left-[42%] px-2 py-1 bg-white/80 rounded-md text-sm text-gray-800">
          #Tasty
        </Link>

        {/* Red Cafe */}
        <Link href={`/dashboard/${studentId}/places/red-cafe`} className="absolute top-[18%] left-[54%] px-2 py-1 bg-white/80 rounded-md text-sm text-gray-800">
          #Red Cafe
        </Link>

        {/* MSB */}
        <Link href={`/dashboard/${studentId}/places/msb`} className="absolute top-[5%] left-[44%] px-2 py-1 bg-white/80 rounded-md text-sm text-gray-800">
          #MSB
        </Link>

        {/* LHC */}
        <Link href={`/dashboard/${studentId}/places/lhc`} className="absolute top-[4%] left-[50%] px-2 py-1 bg-white/80 rounded-md text-sm text-gray-800">
          #LHC
        </Link>

        {/* PSB */}
        <Link href={`/dashboard/${studentId}/places/psb`} className="absolute top-[11%] left-[51%] px-2 py-1 bg-white/80 rounded-md text-sm text-gray-800">
          #PSB
        </Link>

        <Link href={`/dashboard/${studentId}/places/library`} className="absolute top-[16%] left-[36%] px-2 py-1 bg-white/80 rounded-md text-sm text-gray-800">
          #Library
        </Link>

        {/* CSB */}
        <Link href={`/dashboard/${studentId}/places/csb`} className="absolute top-[15%] left-[60%] px-2 py-1 bg-white/80 rounded-md text-sm text-gray-800">
          #CSB
        </Link>

        {/* BSB */}
        <Link href={`/dashboard/${studentId}/places/bsb`} className="absolute top-[20%] left-[67%] px-2 py-1 bg-white/80 rounded-md text-sm text-gray-800">
          #BSB
        </Link>

        {/* Guest House */}
        <Link href={`/dashboard/${studentId}/places/guest-house`} className="absolute top-[9%] left-[30%] px-2 py-1 bg-white/80 rounded-md text-sm text-gray-800">
          #Guest House
        </Link>

        {/* Kathinpara */}
        <Link href={`/dashboard/${studentId}/places/kathinpara`} className="absolute top-[0%] left-[35%] px-2 py-1 bg-white/80 rounded-md text-sm text-gray-800">
          #Kathinpara
        </Link>
      </div>
    </DashboardLayout>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function MainGate() {
  const router = useRouter();

  const handleTextClick = () => {
    router.push('bsb/more'); // relative navigation
  };

  return (
    <DashboardLayout>
      <div
        className="h-full w-full bg-cover bg-center rounded-2xl flex items-center justify-center items-start pt-16"
        style={{ backgroundImage: "url('/images/bsb.jpg')" }}>
        <div 
          className="bg-black/60 rounded-2xl p-6 mx-6 text-white text-center text-3xl font-semibold max-w-3xl cursor-pointer hover:bg-black/70 transition-all duration-300 animate-pulse"
          onClick={handleTextClick}
        >
          This is BSB or Biological science block: This is the biology department of the college
        </div>
      </div>
    </DashboardLayout>
  );
}

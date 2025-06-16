'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';

export default function Anamudi() {
  const router = useRouter();
  const handleTextClick = () => {
    // Navigate to indoor_images page
    router.push('anamudi/more');
  };


  return (
    <DashboardLayout>
      <div
  className="h-screen w-full bg-cover bg-center flex items-center justify-center"
  style={{ backgroundImage: "url('/images/anamudi.jpg')" }}>
       <div 
            className="bg-black/60 rounded-2xl p-6 mx-6 text-white text-center text-3xl font-semibold max-w-3xl cursor-pointer hover:bg-black/70 transition-all duration-300 animate-pulse"
            onClick={handleTextClick}
          >
        This is the Anamudi Hostel block. It consists of many blocks and this is the place where BS_MS students stay. You will be assigned a room in one of these blocks.
      </div>
    </div>

    </DashboardLayout>
  );
}

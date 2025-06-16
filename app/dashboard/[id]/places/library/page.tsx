'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';


export default function MainGate() {
  const router = useRouter();
  const handleTextClick=()=>{
    router.push('library/more');
  }
  
  return (
    <DashboardLayout>
      <div
        className="h-full w-full bg-cover bg-center rounded-2xl flex items-center justify-center items-start pt-16"
        style={{ backgroundImage: "url('/images/library.jpeg')" }}>
          <div 
            className="bg-black/60 rounded-2xl p-6 mx-6 text-white text-center text-3xl font-semibold max-w-3xl cursor-pointer hover:bg-black/70 transition-all duration-300 animate-pulse"
            onClick={handleTextClick}
          >
        This is the Central Library of our college: We hav access to lots of books and journals both online and offline
        </div>
      </div>
    </DashboardLayout>
  );
}

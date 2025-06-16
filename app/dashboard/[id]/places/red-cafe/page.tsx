'use client';
import DashboardLayout from '@/components/DashboardLayout';

const handleTextClick=()=>{
  window.location.href=''
}

export default function MainGate() {
  return (
    <DashboardLayout>
      <div
        className="h-full w-full bg-cover bg-center rounded-2xl flex items-center justify-center items-start pt-16"
        style={{ backgroundImage: "url('/images/red-cafe.jpeg')" }}>
          <div 
            className="bg-black/60 rounded-2xl p-6 mx-6 text-white text-center text-3xl font-semibold max-w-3xl cursor-pointer hover:bg-black/70 transition-all duration-300 animate-pulse"
            onClick={handleTextClick}
          >
        This is Red Cafe: one of the resturants for having food and drinks. You can also order food from your hostels using their whatsapp
        </div>
      </div>
    </DashboardLayout>
  );
}

'use client';
import DashboardLayout from '@/components/DashboardLayout';

export default function MainGate() {
  return (
    <DashboardLayout>
      <div
        className="h-full w-full bg-cover bg-center rounded-2xl flex items-center justify-center items-start pt-16"
        style={{ backgroundImage: "url('/images/main.jpg')" }}>
         <div className="bg-black/60 rounded-2xl p-6 mx-6 text-white text-center text-3xl font-semibold max-w-3xl">
        This is the main gate of the campus that you see when entering.
        </div>
      </div>
    </DashboardLayout>
  );
}

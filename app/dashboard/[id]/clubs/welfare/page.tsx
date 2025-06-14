'use client';
import DashboardLayout from '@/components/DashboardLayout';

export default function WelfareClubs() {
  return (
    <DashboardLayout>
      <div
        className="h-full w-full bg-cover bg-center rounded-2xl flex items-center justify-center text-3xl font-semibold text-white"
        style={{ backgroundImage: "url('/images/anamudi.jpg')" }}>
        This is the Anamudi Hostel block
      </div>
    </DashboardLayout>
  );
}

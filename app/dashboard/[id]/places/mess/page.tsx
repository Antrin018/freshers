'use client';
import DashboardLayout from '@/components/DashboardLayout';

export default function Mess() {
  return (
    <DashboardLayout>
      <div
        className="h-full w-full bg-cover bg-center rounded-2xl flex items-center justify-center text-3xl font-semibold text-white"
        style={{ backgroundImage: "url('/images/cdh1.jpg')" }}>
        This is CDH1 or our mess.
      </div>
    </DashboardLayout>
  );
}

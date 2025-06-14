'use client';
import DashboardLayout from '@/components/DashboardLayout';

export default function Indoor() {
  return (
    <DashboardLayout>
      <div
        className="h-full w-full bg-cover bg-center rounded-2xl flex items-center justify-center text-3xl font-semibold text-white"
        style={{ backgroundImage: "url('/images/indoor.jpg')" }}>
        This is our Indoor stadium
      </div>
    </DashboardLayout>
  );
}

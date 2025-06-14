'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase-client';

export default function OverviewPage() {
  const { id } = useParams(); // 👈 get the studentId from the route
  const [name, setName] = useState<string>('Fresher');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStudentName = async () => {
      if (!id || typeof id !== 'string') return;

      const { data, error } = await supabase
        .from('students')
        .select('name')
        .eq('id', id)
        .single();

      if (data && !error) {
        setName(data.name);
      }

      setLoading(false);
    };

    fetchStudentName();
  }, [id]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-full text-3xl font-semibold text-gray-800">
        {loading ? 'Loading...' : `Welcome, ${name}!`}
      </div>
    </DashboardLayout>
  );
}

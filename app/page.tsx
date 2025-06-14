'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

export default function HomePage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
  
    if (!email || !name) {
      setMessage('⚠️ Please enter your name and email.');
      return;
    }
  
    if (!email.endsWith('25@iisertvm.ac.in')) {
      setMessage('⚠️ Only Batch-25 student mail IDs are allowed.');
      return;
    }
  
    setLoading(true);
  
    // Step 1: Check if student exists
    const { data: existingStudent, error: fetchError } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single();
  
    let studentId;
  
    if (fetchError && fetchError.code !== 'PGRST116') {
      setMessage(`❌ Unexpected error: ${fetchError.message}`);
      setLoading(false);
      return;
    }
  
    // Step 2: Insert if not existing
    if (!existingStudent) {
      const { data: insertedStudent, error: insertError } = await supabase
        .from('students')
        .insert([{ name, email }])
        .select('id') // return ID of the newly inserted student
        .single();
  
      if (insertError) {
        setMessage(`❌ Could not register: ${insertError.message}`);
        setLoading(false);
        return;
      }
  
      studentId = insertedStudent.id;
    } else {
      studentId = existingStudent.id;
    }
  
    setMessage('✅ Success! Redirecting...');
    router.push(`/dashboard/${studentId}/overview`);
    setLoading(false);
  };
  

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-pink-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md backdrop-blur-md bg-white/30 px-8 py-20 rounded-xl shadow-lg border border-white/40 text-gray-800">
        <h1 className="text-4xl font-semibold text-center mb-6 text-gray-800">Student Sign In</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b-2 border-gray-400 focus:border-blue-600 outline-none py-2 placeholder-gray-600 text-gray-800"
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b-2 border-gray-400 focus:border-blue-600 outline-none py-2 placeholder-gray-600 text-gray-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 text-white py-2 rounded-full font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Entering...' : 'Enter'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-center text-gray-700">{message}</p>
        )}
      </div>
    </main>
  );
}

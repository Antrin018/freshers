'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
    
    console.log('Form submitted with:', { name, email }); // Debug log
  
    if (!email || !name) {
      setMessage('⚠️ Please enter your name and email.');
      return;
    }
  
    if (!email.endsWith('25@iisertvm.ac.in')) {
      setMessage('Only Batch-25 students and iiser mail ids are allowed.');
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
      console.error('Fetch error:', fetchError); // Debug log
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
        console.error('Insert error:', insertError); // Debug log
        setMessage(`❌ Could not register: ${insertError.message}`);
        setLoading(false);
        return;
      }
  
      studentId = insertedStudent.id;
    } else {
      studentId = existingStudent.id;
    }
  
    console.log('Redirecting to dashboard with studentId:', studentId); // Debug log
    setMessage('✅ Success! Redirecting...');
    router.push(`/dashboard/${studentId}/overview`);
    setLoading(false);
  };

  return (
    <main className="min-h-screen w-full relative flex items-center justify-center">
      {/* Full background with image and gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Image
          src="/images/batch.jpeg"
          alt="Artistic background"
          fill
          className="object-cover opacity-80"
          priority
        />
      </div>

      {/* Centered sign-in form - no container styling */}
      <div className="relative z-10 w-full max-w-md px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">B24 Welcomes You!!!</h1>
          <p className="text-red-400 text-lg drop-shadow-md">Sign in with your college mail id</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-0 border-b-2 border-white/30 focus:border-red-400 outline-none py-4 text-white placeholder-gray-300 transition-colors text-lg"
              />
            </div>

            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 border-b-2 border-white/30 focus:border-red-400 outline-none py-4 text-white placeholder-gray-300 transition-colors text-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white py-4 rounded-full font-medium text-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            {loading ? 'Entering...' : 'Sign in'}
          </button>
        </form>

        {message && (
          <div className="mt-8 text-center">
            <p className="text-sm text-white bg-black/20 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-white/20">{message}</p>
          </div>
        )}
      </div>
    </main>
  );
}
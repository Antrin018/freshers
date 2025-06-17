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
  
    if (!email || !name) {
      setMessage('⚠️ Please enter your name and email.');
      return;
    }
  
    /*if (!email.endsWith('25@iisertvm.ac.in')) {
      setMessage('Only Batch-25 students and iiser mail ids are allowed.');
      return;
    }*/
  
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
    <main className="min-h-screen w-full relative overflow-hidden">
      {/* Left side - Image section with diagonal cut */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        style={{
          clipPath: 'polygon(0 0, 65% 0, 70% 100%, 0 100%)'
        }}
      >
        {/* Background artistic image */}
        <div className="absolute inset-0">
          <Image
            src="/images/indoor.jpg"
            alt="Artistic background"
            fill
            className="object-cover opacity-80"
            priority
          />
        </div>
        </div>
      

      {/* Right side - Sign in form */}
      <div className="absolute right-0 top-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100"
           style={{
             clipPath: 'polygon(35% 0, 100% 0, 100% 100%, 65% 100%)'
           }}>
        <div className="h-full flex items-center justify-center">
          <div className="w-full max-w-md ml-auto mr-50 px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">B24 Welcomes You!!!</h1>
            <p className="text-gray-600 text-lg">Sign in with your college mail id</p>
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
                  className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-red-500 outline-none py-4 text-gray-900 placeholder-gray-500 transition-colors text-lg"
                />
              </div>

              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-red-500 outline-none py-4 text-gray-900 placeholder-gray-500 transition-colors text-lg"
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
              <p className="text-sm text-gray-700 bg-white/80 p-4 rounded-lg shadow-sm border border-gray-200">{message}</p>
            </div>
          )}
          </div>
        </div>
      </div>
    </main>
  );
}
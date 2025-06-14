'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!email || !password) {
      setMessage('⚠️ Please enter your email and password.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(`❌ Login failed: ${error.message}`);
    } else {
      setMessage('✅ Login successful! Redirecting...');
      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-pink-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md backdrop-blur-md bg-white/30 px-8 py-20 rounded-xl shadow-lg border border-white/40 text-gray-800">
        <h1 className="text-4xl font-semibold text-center mb-6 text-gray-800">Student Login</h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b-2 border-gray-400 focus:border-blue-600 outline-none py-2 placeholder-gray-600 text-gray-800"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b-2 border-gray-400 focus:border-blue-600 outline-none py-2 placeholder-gray-600 text-gray-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 text-white py-2 rounded-full font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-700">
          New here?{' '}
          <a
            href="/"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Sign up instead
          </a>
        </p>

        {message && (
          <p className="mt-4 text-sm text-center text-gray-700">{message}</p>
        )}
      </div>
    </main>
  );
}

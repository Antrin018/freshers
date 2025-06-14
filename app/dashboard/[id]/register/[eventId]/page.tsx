'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

export default function EventRegisterPage() {
  const { eventId, id: studentId } = useParams();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [token, setToken] = useState<number | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [existingToken, setExistingToken] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch student info
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('name, email')
          .eq('id', studentId)
          .single();

        if (studentError || !studentData) {
          console.error('Error fetching student info:', studentError);
          return;
        }

        setName(studentData.name);
        setEmail(studentData.email);

        // Fetch event info
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('title, image_url')
          .eq('id', eventId)
          .single();

        if (eventError || !eventData) {
          console.error('Error fetching event info:', eventError);
          return;
        }

        setEventTitle(eventData.title);
        setEventImage(eventData.image_url);

        // Check if already registered
        const { data: existing, error: existingError } = await supabase
          .from('registrations')
          .select('token')
          .eq('event_id', eventId)
          .eq('email', studentData.email)
          .single();

        if (existing && !existingError) {
          setAlreadyRegistered(true);
          setExistingToken(existing.token);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: existing } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('email', email)
      .single();

    if (existing) {
      setAlreadyRegistered(true);
      setExistingToken(existing.token);
      return;
    }

    const { data: maxTokenData, error: maxTokenError } = await supabase
      .from('registrations')
      .select('token')
      .eq('event_id', eventId)
      .order('token', { ascending: false })
      .limit(1);

    if (maxTokenError) {
      alert('Error fetching token count.');
      return;
    }

    const nextToken = (maxTokenData?.[0]?.token || 0) + 1;

    const { data, error } = await supabase
      .from('registrations')
      .insert([{ event_id: eventId, name, email, description, token: nextToken }])
      .select('token')
      .single();

    if (error) {
      alert('Something went wrong. Try again.');
      return;
    }

    setToken(data.token);
  };

  const inputStyle =
    'bg-transparent border-b border-white placeholder-white focus:outline-none focus:border-yellow-300 py-2';

  // Show loader while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black text-white">
        <div className="text-xl animate-pulse">Loading event info...</div>
      </div>
    );
  }

  // Show token if registered
  if (token || alreadyRegistered) {
    return (
      <div
        className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url('/images/fresher-page.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-0" />

        <div className="relative z-10 flex flex-col md:flex-row w-full max-w-[90%] mx-auto rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
          <div className="w-full md:w-1/2 h-96 md:h-auto">
            <div
              className="h-full w-full bg-cover bg-center"
              style={{
                backgroundImage: eventImage
                  ? `url(${eventImage})`
                  : 'linear-gradient(135deg, #f43f5e, #f97316, #facc15, #92400e)',
              }}
            />
          </div>

          <div className="w-full md:w-1/2 p-8 bg-white/10 backdrop-blur-lg text-white flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-4 text-center">🎉 You're Registered!</h2>
            <p className="text-lg text-center">
              Your token number for <span className="text-yellow-300 font-semibold">{eventTitle}</span> is:
            </p>
            <p className="text-3xl font-mono text-yellow-400 my-4 text-center">
              {token || existingToken}
            </p>
            <p className="text-sm text-white/70 mb-4 text-center">
              This token is unique to this event. Please save it or show it at the event entrance.
            </p>
            <button
              onClick={() => router.push(`/dashboard/${studentId}/freshers`)}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 self-center"
            >
              Back to Freshers Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url('/images/fresher-page.jpg')` }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-0" />

      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <div className="w-full md:w-1/2 h-96 md:h-auto">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: eventImage
                ? `url(${eventImage})`
                : 'linear-gradient(135deg, #f43f5e, #f97316, #facc15, #92400e)',
            }}
          />
        </div>

        <div className="w-full md:w-1/2 p-8 bg-white/5 backdrop-blur-lg text-white flex flex-col justify-center">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Register for: <span className="text-yellow-300">{eventTitle}</span>
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            <input className={inputStyle} placeholder="Your Name" value={name} disabled />
            <input className={inputStyle} placeholder="Your Email" value={email} disabled />
            <textarea
              className={`${inputStyle} resize-none`}
              placeholder="What will you do in the event?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

export default function TeamEventRegisterPage() {
  const { eventId, id: studentId } = useParams();
  const router = useRouter();

  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState(['']); // Dynamic list
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [token, setToken] = useState<number | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [existingToken, setExistingToken] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamSizeLimit, setTeamSizeLimit] = useState<number>(4); // Default max
  const [teamSizeError, setTeamSizeError] = useState<string | null>(null);

  // Function to get image URL from Supabase storage
  const getEventImageUrl = async (eventId: string): Promise<string | null> => {
    try {
      // List files in the bucket to find the file with the eventId
      const { data: files, error } = await supabase.storage
        .from('event-image')
        .list('', {
          limit: 100,
          offset: 0
        });

      if (error) {
        console.error('Error listing files:', error);
        return null;
      }

      // Find the file that starts with the eventId
      const eventFile = files?.find(file => 
        file.name.startsWith(`${eventId}.`)
      );

      if (!eventFile) {
        console.log('No image found for event:', eventId);
        return null;
      }

      // Get the public URL for the file
      const { data } = supabase.storage
        .from('event-image')
        .getPublicUrl(eventFile.name);

      return data.publicUrl;
    } catch (err) {
      console.error('Error fetching event image:', err);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: studentData } = await supabase
          .from('students')
          .select('email')
          .eq('id', studentId)
          .single();
        if (!studentData) return;

        setEmail(studentData.email);

        // Fetch event info (removed image_url from select)
        const { data: eventData } = await supabase
          .from('events')
          .select('title, team_size')
          .eq('id', eventId)
          .single();
        if (!eventData) return;

        setEventTitle(eventData.title);
        setTeamSizeLimit(eventData.team_size || 4);

        // Fetch event image from storage
        const imageUrl = await getEventImageUrl(eventId as string);
        if (imageUrl) {
          setEventImage(imageUrl);
        }

        const { data: existing } = await supabase
          .from('registrations')
          .select('token')
          .eq('event_id', eventId)
          .eq('email', studentData.email)
          .single();

        if (existing) {
          setAlreadyRegistered(true);
          setExistingToken(existing.token);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, studentId]);

  const handleMemberChange = (index: number, value: string) => {
    const updated = [...teamMembers];
    updated[index] = value;
    setTeamMembers(updated);
  };

  const addMember = () => {
    if (teamMembers.length < teamSizeLimit) {
      setTeamMembers([...teamMembers, '']);
    }
  };

  const removeMember = (index: number) => {
    if (teamMembers.length > 1) {
      const updated = teamMembers.filter((_, i) => i !== index);
      setTeamMembers(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validMembers = teamMembers
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    if (validMembers.length < 2) {
      setTeamSizeError('Minimum 2 team members are required.');
      return;
    }

    if (validMembers.length > teamSizeLimit) {
      setTeamSizeError(`Maximum team size is ${teamSizeLimit}.`);
      return;
    }

    setTeamSizeError(null);

    const { data: existingEmail } = await supabase
      .from('registrations')
      .select('token')
      .eq('event_id', eventId)
      .eq('email', email)
      .single();

    if (existingEmail) {
      setAlreadyRegistered(true);
      setExistingToken(existingEmail.token);
      return;
    }

    const { data: existingTeam } = await supabase
      .from('registrations')
      .select('token')
      .eq('event_id', eventId)
      .eq('Team_name', teamName)
      .single();

    if (existingTeam) {
      setAlreadyRegistered(true);
      setExistingToken(existingTeam.token);
      return;
    }

    const { data: maxTokenData } = await supabase
      .from('registrations')
      .select('token')
      .eq('event_id', eventId)
      .order('token', { ascending: false })
      .limit(1);

    const nextToken = (maxTokenData?.[0]?.token || 0) + 1;

    const { data, error } = await supabase
      .from('registrations')
      .insert([{
        event_id: eventId,
        student_id: studentId,
        name: validMembers.join(', '),
        email,
        description,
        token: nextToken,
        Team_name: teamName,
      }])
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

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black text-white">
        <div className="text-xl animate-pulse">Loading event info...</div>
      </div>
    );
  }

  if (token || alreadyRegistered) {
    return (
      <div
        className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url('/images/fresher-page.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-0" />
        <div className="relative z-10 flex flex-col md:flex-row w-full max-w-[90%] mx-auto rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
          <div className="w-full md:w-1/2 h-96 md:h-auto bg-cover bg-center" style={{
            backgroundImage: eventImage
              ? `url(${eventImage})`
              : 'linear-gradient(135deg, #f43f5e, #f97316, #facc15, #92400e)',
          }} />
          <div className="w-full md:w-1/2 p-8 bg-white/10 backdrop-blur-lg text-white flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-4 text-center">🎉 Already Registered!</h2>
            <p className="text-lg text-center">
              Your token for <span className="text-yellow-300 font-semibold">{eventTitle}</span> is:
            </p>
            <p className="text-3xl font-mono text-yellow-400 my-4 text-center">
              {token || existingToken}
            </p>
            <p className="text-sm text-white/70 text-center">
              Please save this token or show it during check-in.
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

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url('/images/fresher-page.jpg')` }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-0" />
      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <div className="w-full md:w-1/2 h-96 md:h-auto bg-cover bg-center" style={{
          backgroundImage: eventImage
            ? `url(${eventImage})`
            : 'linear-gradient(135deg, #f43f5e, #f97316, #facc15, #92400e)',
        }} />
        <div className="w-full md:w-1/2 p-8 bg-white/5 backdrop-blur-lg text-white flex flex-col justify-center">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Team Registration for: <span className="text-yellow-300">{eventTitle}</span>
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              className={inputStyle}
              placeholder="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm">Team Members ({teamMembers.length} / {teamSizeLimit})</label>
                <button
                  type="button"
                  onClick={addMember}
                  disabled={teamMembers.length >= teamSizeLimit}
                  className="text-yellow-300 text-sm"
                >
                  ➕ Add Member
                </button>
              </div>
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    className={`${inputStyle} w-full`}
                    placeholder={`Member ${index + 1} Name`}
                    value={member}
                    onChange={(e) => handleMemberChange(index, e.target.value)}
                    required
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="text-red-400"
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
              {teamSizeError && (
                <p className="text-red-400 text-sm">{teamSizeError}</p>
              )}
            </div>
            <input
              className={inputStyle}
              placeholder="Your Email"
              value={email}
              disabled
            />
            <textarea
              className={`${inputStyle} resize-none`}
              placeholder="Describe your team's activity"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded"
            >
              Register Team
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
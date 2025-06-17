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
  const [submitting, setSubmitting] = useState(false);
  
  // New states for audio/video functionality
  const [audioRequired, setAudioRequired] = useState(false);
  const [videoRequired, setVideoRequired] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');

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

  // Function to validate file size (50MB limit)
  const validateFileSize = (file: File): boolean => {
    const maxSizeInBytes = 50 * 1024 * 1024; // 50MB in bytes
    return file.size <= maxSizeInBytes;
  };

  // Function to get file extension
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop() || '';
  };

  // Function to upload audio/video files
  const uploadMediaFiles = async (): Promise<boolean> => {
    try {
      if (audioFile && audioRequired) {
        if (!validateFileSize(audioFile)) {
          setUploadError('Audio file size exceeds 50MB limit');
          return false;
        }

        const audioExtension = getFileExtension(audioFile.name);
        const audioFileName = `${eventId}_${studentId}.${audioExtension}`;
        
        const { error: audioError } = await supabase.storage
          .from('event-image')
          .upload(`audio/${audioFileName}`, audioFile, {
            upsert: true
          });

        if (audioError) {
          console.error('Error uploading audio:', audioError);
          setUploadError('Failed to upload audio file');
          return false;
        }
      }

      if (videoFile && videoRequired) {
        if (!validateFileSize(videoFile)) {
          setUploadError('Video file size exceeds 50MB limit');
          return false;
        }

        const videoExtension = getFileExtension(videoFile.name);
        const videoFileName = `${eventId}_${studentId}.${videoExtension}`;
        
        const { error: videoError } = await supabase.storage
          .from('event-image')
          .upload(`video/${videoFileName}`, videoFile, {
            upsert: true
          });

        if (videoError) {
          console.error('Error uploading video:', videoError);
          setUploadError('Failed to upload video file');
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error('Error uploading media files:', err);
      setUploadError('Failed to upload media files');
      return false;
    }
  };

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

        // Fetch event info including audio and video columns
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('title, audio, video')
          .eq('id', eventId)
          .single();

        if (eventError || !eventData) {
          console.error('Error fetching event info:', eventError);
          return;
        }

        setEventTitle(eventData.title);
        setAudioRequired(eventData.audio || false);
        setVideoRequired(eventData.video || false);

        // Fetch event image from storage
        const imageUrl = await getEventImageUrl(eventId as string);
        if (imageUrl) {
          setEventImage(imageUrl);
        }

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

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validateFileSize(file)) {
        setUploadError('Audio file size exceeds 50MB limit');
        return;
      }
      setAudioFile(file);
      setUploadError('');
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validateFileSize(file)) {
        setUploadError('Video file size exceeds 50MB limit');
        return;
      }
      setVideoFile(file);
      setUploadError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setSubmitting(true);

    // Check if required files are provided
    if (audioRequired && !audioFile) {
      setUploadError('Audio file is required for this event');
      setSubmitting(false);
      return;
    }

    if (videoRequired && !videoFile) {
      setUploadError('Video file is required for this event');
      setSubmitting(false);
      return;
    }

    const { data: existing } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('email', email)
      .single();

    if (existing) {
      setAlreadyRegistered(true);
      setExistingToken(existing.token);
      setSubmitting(false);
      return;
    }

    // Upload media files first
    const uploadSuccess = await uploadMediaFiles();
    if (!uploadSuccess) {
      setSubmitting(false);
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
      setSubmitting(false);
      return;
    }

    const nextToken = (maxTokenData?.[0]?.token || 0) + 1;

    const { data, error } = await supabase
      .from('registrations')
      .insert([{ event_id: eventId, student_id: studentId, name, email, description, token: nextToken }])
      .select('token')
      .single();

    if (error) {
      alert('Something went wrong. Try again.');
      setSubmitting(false);
      return;
    }

    setToken(data.token);
    setSubmitting(false);
  };

  const inputStyle =
    'bg-transparent border-b border-white placeholder-white focus:outline-none focus:border-yellow-300 py-2';

  const fileInputStyle =
    'bg-transparent border border-white rounded px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-yellow-400 file:text-black hover:file:bg-yellow-500';

  // Show loader while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black text-white">
        <div className="text-xl animate-pulse">Loading event info...</div>
      </div>
    );
  }

  // Show submitting loader
  if (submitting) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black text-white">
        <div className="text-xl animate-pulse">Generating token....</div>
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
            <h2 className="text-2xl font-bold mb-4 text-center">🎉 You&apos;re Registered!</h2>
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
          
          {/* File size notice */}
          {(audioRequired || videoRequired) && (
            <p className="text-sm text-yellow-300 mb-4 text-center">
              Maximum file size allowed: 50MB
            </p>
          )}

          {/* Upload error message */}
          {uploadError && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded mb-4">
              {uploadError}
            </div>
          )}

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

            {/* Audio upload section */}
            {audioRequired && (
              <div className="space-y-2">
                <label className="text-sm text-yellow-300">Audio Upload (Required)</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  className={fileInputStyle}
                  required
                />
                {audioFile && (
                  <p className="text-xs text-green-300">
                    Selected: {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>
            )}

            {/* Video upload section */}
            {videoRequired && (
              <div className="space-y-2">
                <label className="text-sm text-yellow-300">Video Upload (Required)</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className={fileInputStyle}
                  required
                />
                {videoFile && (
                  <p className="text-xs text-green-300">
                    Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>
            )}

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
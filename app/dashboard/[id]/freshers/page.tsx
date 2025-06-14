'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useSearchParams, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Event {
  id: string | number;
  title: string;
  description: string;
  date: string;
  time: string;
  registration_open: boolean;
}

export default function FreshersPage() {
  const searchParams = useSearchParams();
  const { id: studentId } = useParams(); // <-- 🆕 Get studentId
  const name = searchParams.get('name') || 'Fresher';
  const [events, setEvents] = useState<Event[]>([]);
  const [expandedEvent, setExpandedEvent] = useState<number | string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('time', { ascending: true });

      if (!error && data) setEvents(data);
    };
    fetchEvents();
  }, []);

  return (
    <DashboardLayout>
      <div
        className="min-h-screen w-full bg-cover bg-center rounded-2xl overflow-hidden"
        style={{ backgroundImage: "url('/images/fresher-page.jpg')" }}
      >
        {/* Header */}
        <div className="pt-16 px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
            Welcome {name}, Batch-24 invites you to{' '}
            <span className="text-yellow-300 drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
              Ignite: Fresher's Party 2025!!!
            </span>
          </h1>
        </div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto mt-16 px-4 pb-16">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-orange-500 z-0" />

          <div className="relative z-10 flex flex-col space-y-20">
            {events.map((event, index) => {
              const isLeft = index % 2 === 0;
              const isExpanded = expandedEvent === event.id;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className={`relative w-full flex ${isLeft ? 'justify-start' : 'justify-end'}`}
                >
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-600 rounded-full z-20 shadow-lg animate-pulse" />
                  <div
                    className={`absolute top-4 z-10 w-6 h-1 bg-orange-500 ${
                      isLeft
                        ? 'right-[calc(50%-8px)] translate-x-full rounded-l-full'
                        : 'left-[calc(50%-8px)] -translate-x-full rounded-r-full'
                    }`}
                  />

                  <div
                    className={`w-1/2 flex flex-col ${
                      isLeft ? 'items-end pr-4 text-right' : 'items-start pl-4 text-left'
                    } text-white cursor-pointer transition-shadow duration-300 hover:shadow-yellow-500`}
                    onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                  >
                    <p className="text-sm text-orange-600 font-semibold mb-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
                      {event.time}
                    </p>
                    <h2 className="text-lg font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                      {event.title}
                    </h2>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4 }}
                          className="mt-2 text-sm text-black/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                        >
                          <p className="mb-2">{event.description}</p>
                          {event.registration_open ? (
                            <a
                              href={`/dashboard/${studentId}/register/${event.id}`} // <-- 🆕 Uses studentId
                              className="inline-block px-4 py-1 mt-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded"
                            >
                              Register
                            </a>
                          ) : (
                            <p className="mt-2 text-red-300 font-medium">Registration Closed</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-1">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

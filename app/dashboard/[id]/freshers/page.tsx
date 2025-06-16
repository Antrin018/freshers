'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useSearchParams, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles, Users, User } from 'lucide-react';

interface Event {
  id: string | number;
  title: string;
  description: string;
  date: string;
  time: string;
  registration_open: boolean;
  Team_event?: boolean;
}

export default function FreshersPage() {
  const searchParams = useSearchParams();
  const { id: studentId } = useParams();
  const name = searchParams.get('name') || 'Fresher';

  const [events, setEvents] = useState<Event[]>([]);
  const [expandedEvent, setExpandedEvent] = useState<number | string | null>(null);
  const [fireStatus, setFireStatus] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const fetchFireStatus = async () => {
      const { data, error } = await supabase
        .from('admin_status')
        .select('fire_status')
        .single();

      if (!error && data) setFireStatus(data.fire_status);
    };

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, description, date, time, registration_open, Team_event')
        .order('time', { ascending: true });

      if (!error && data) setEvents(data);
    };

    // Initial fetch
    fetchFireStatus();
    fetchEvents();

    // Set up real-time subscriptions
    const adminStatusChannel = supabase
      .channel('admin_status_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_status'
        },
        (payload) => {
          console.log('Admin status changed:', payload);
          interface AdminStatusPayload {
            fire_status: number;
          }
          if (payload.new && 'fire_status' in payload.new && typeof (payload.new as AdminStatusPayload).fire_status === 'number') {
            setFireStatus((payload.new as AdminStatusPayload).fire_status);
          }
          
        }
      )
      .subscribe();

    const eventsChannel = supabase
      .channel('events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        (payload) => {
          console.log('Events changed:', payload);
          // Refetch events when any event is updated
          fetchEvents();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(adminStatusChannel);
      supabase.removeChannel(eventsChannel);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        duration: 0.8
      }
    }
  };

  const titleVariants = {
    hidden: { 
      opacity: 0, 
      y: -50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 20,
        duration: 1.2
      }
    }
  };

  return (
    <DashboardLayout>
      <div
        className="min-h-screen w-full bg-cover bg-center rounded-2xl overflow-hidden relative"
        style={{ backgroundImage: "url('/images/fresher-page.jpg')" }}
      >
        {/* Animated overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
        
        {/* Floating particles */}
        {isClient && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => {
              // Use deterministic values based on index
              const leftPos = (i * 7.5) % 100;
              const topPos = (i * 12.3) % 100;
              const duration = 15 + (i % 5) * 2;
              const delay = i * 0.8;
              
              return (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400/30 rounded-full"
                  animate={{
                    x: [0, 100, 0],
                    y: [0, -100, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: duration,
                    repeat: Infinity,
                    delay: delay,
                    ease: "easeInOut"
                  }}
                  style={{
                    left: `${leftPos}%`,
                    top: `${topPos}%`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Header with enhanced animations */}
        <motion.div 
          className="pt-16 px-4 text-center relative z-10"
          variants={titleVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="relative inline-block">
            <motion.div
              className="absolute -top-4 -right-4"
              animate={{
                scale: [1, 1.5, 1],
                rotate: [0, 180, 360],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </motion.div>
            <motion.div
              className="absolute -bottom-2 -left-6"
              animate={{
                scale: [1, 1.5, 1],
                rotate: [0, 180, 360],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <Sparkles className="w-6 h-6 text-orange-400" />
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
              Welcome{' '}
              <motion.span
                className="text-yellow-300"
                animate={{
                  textShadow: [
                    "0 0 10px rgba(255,255,0,0.5)",
                    "0 0 20px rgba(255,255,0,0.8)",
                    "0 0 10px rgba(255,255,0,0.5)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {name}
              </motion.span>
              , Batch-24 invites you to{' '}
              <motion.span 
                className="text-yellow-300 drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Ignite: Fresher&apos;s Party 2025!!!
              </motion.span>
            </h1>
          </div>
        </motion.div>

        {/* Conditional Content */}
        <div className="relative max-w-4xl mx-auto mt-16 px-4 pb-16">
          {fireStatus === 400 ? (
            <motion.div 
              className="text-center text-white"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                duration: 0.8
              }}
            >
              <motion.h2 
                className="text-4xl font-bold text-red-500 mb-4"
                animate={{
                  textShadow: [
                    "0 0 10px rgba(255,0,0,0.5)",
                    "0 0 20px rgba(255,0,0,0.8)",
                    "0 0 10px rgba(255,0,0,0.5)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Registrations are closed
              </motion.h2>
            </motion.div>
          ) : fireStatus === 200 ? (
            <>
              {/* Enhanced timeline line */}
              <motion.div 
                className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 z-0 rounded-full"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              
              {/* Pulsing glow effect on timeline */}
              <motion.div 
                className="absolute left-1/2 transform -translate-x-1/2 h-full w-3 bg-orange-500/30 z-0 rounded-full blur-sm"
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              <motion.div 
                className="relative z-10 flex flex-col space-y-16"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {events.map((event, index) => {
                  const isLeft = index % 2 === 0;
                  const isExpanded = expandedEvent === event.id;

                  return (
                    <motion.div
                      key={event.id}
                      variants={itemVariants}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      className={`relative w-full flex ${isLeft ? 'justify-start' : 'justify-end'}`}
                    >
                      {/* Enhanced timeline node */}
                      <motion.div 
                        className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full z-20 shadow-lg"
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(255, 165, 0, 0.7)",
                            "0 0 0 10px rgba(255, 165, 0, 0)",
                            "0 0 0 0 rgba(255, 165, 0, 0)"
                          ],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.2,
                          ease: "easeInOut"
                        }}
                      />
                      
                      {/* Enhanced connecting line */}
                      <motion.div
                        className={`absolute top-8 z-10 w-12 h-1 bg-gradient-to-r from-orange-400 to-orange-600 shadow-sm ${
                          isLeft
                            ? 'right-[calc(50%-8px)] translate-x-full rounded-l-full'
                            : 'left-[calc(50%-8px)] -translate-x-full rounded-r-full'
                        }`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.5 + index * 0.2, duration: 0.5 }}
                      />

                      <motion.div
                        className={`w-1/2 flex flex-col ${
                          isLeft ? 'items-end pr-8 text-right' : 'items-start pl-8 text-left'
                        } text-white cursor-pointer group`}
                        onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                        whileHover={{ 
                          x: isLeft ? -5 : 5,
                          transition: { duration: 0.2 }
                        }}
                      >
                        {/* Time display - centered and enlarged */}
                        <motion.div
                          className="text-center mb-2"
                          whileHover={{ scale: 1.1 }}
                        >
                          <p className="text-lg font-bold text-orange-400 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
                            {event.time}
                          </p>
                        </motion.div>

                        {/* Event title - enlarged with gradient underline */}
                        <motion.div
                          className="relative mb-4"
                          whileHover={{ scale: 1.05 }}
                        >
                          <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)] group-hover:text-yellow-300 transition-colors duration-300">
                            {event.title}
                          </h2>
                          {/* Gradient underline */}
                          <motion.div
                            className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-600 rounded-full"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                          />
                        </motion.div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, y: -10 }}
                              animate={{ opacity: 1, height: 'auto', y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -10 }}
                              transition={{ 
                                duration: 0.4,
                                ease: "easeInOut"
                              }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4">
                                <p className="text-base text-gray-200 mb-4 leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                                  {event.description}
                                </p>
                                
                                <div className="flex items-center gap-2 mb-4">
                                  {event.Team_event ? (
                                    <Users className="w-5 h-5 text-blue-400" />
                                  ) : (
                                    <User className="w-5 h-5 text-green-400" />
                                  )}
                                  <span className="text-sm text-gray-300 font-medium">
                                    {event.Team_event ? 'Team Event' : 'Individual Event'}
                                  </span>
                                </div>
                                
                                {event.registration_open ? (
                                  <motion.a
                                    href={`/dashboard/${studentId}/${
                                      event.Team_event ? 'register_team' : 'register'
                                    }/${event.id}`}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold rounded-lg shadow-lg transition-all duration-300"
                                    whileHover={{ 
                                      scale: 1.05,
                                      boxShadow: "0 10px 25px rgba(255, 165, 0, 0.3)"
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Sparkles className="w-5 h-5" />
                                    Register Now
                                  </motion.a>
                                ) : (
                                  <p className="text-red-400 font-bold flex items-center gap-2">
                                    <span className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></span>
                                    Registration Closed
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <motion.div 
                          className="mt-4 flex justify-center"
                          animate={{ 
                            rotateX: isExpanded ? 180 : 0 
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-6 h-6 text-orange-400 group-hover:text-yellow-400 transition-colors duration-300" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-orange-400 group-hover:text-yellow-400 transition-colors duration-300" />
                          )}
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Particle {
  id: number;
  left: number;
  top: number;
  animationDelay: number;
  animationDuration: number;
}

export default function Clubs() {
  const { id: studentId } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles with random positions after component mounts
    const generatedParticles = [...Array(12)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 4,
      animationDuration: 3 + Math.random() * 2
    }));
    setParticles(generatedParticles);

    // Trigger the summoning animation after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout>
      <div
        className="relative w-full h-screen bg-cover bg-center rounded-2xl overflow-hidden"
        style={{ backgroundImage: "url('/images/club_main.jpg')" }}
      >
        {/* Magical overlay with pulsing effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 animate-pulse" />
        
        {/* Floating particles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.animationDelay}s`,
                animationDuration: `${particle.animationDuration}s`
              }}
            />
          ))}
        </div>

        {/* Main title with summoning effect */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
          <h1 className={`text-4xl md:text-6xl font-bold text-white text-center transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-75'
          }`}
          style={{ 
            textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(147,51,234,0.3)',
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
          }}>
            Choose Your Circle
          </h1>
        </div>

        {/* Centered Club Circles with Summoning Animation */}
        <div className="absolute inset-0 flex justify-center items-center gap-12 flex-wrap p-4">
          {/* Science Club */}
          <Link
            href={`/dashboard/${studentId}/clubs/science`}
            className="flex flex-col items-center group relative"
          >
            <div className={`transform transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0 scale-100 rotate-0' : 'opacity-0 translate-y-20 scale-50 rotate-180'
            }`}
            style={{ animationDelay: '0.5s' }}>
              {/* Magical circle border */}
              <div className="absolute inset-0 w-80 h-80 rounded-full border-2 border-blue-400/30 animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 w-80 h-80 rounded-full border border-blue-300/20 animate-pulse" />
              
              {/* Main club circle */}
              <div className="w-70 h-70 rounded-full overflow-hidden border-4 border-white group-hover:border-blue-400 shadow-2xl transition-all duration-500 relative animate-float-gentle group-hover:scale-110 group-hover:shadow-blue-500/50">
              <Image
                src="/images/clubs/science.jpg"
                alt="Science Clubs"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              {/* Glowing orbs around the circle */}
              <div className="absolute inset-0 w-80 h-80 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 bg-blue-400 rounded-full animate-orbit"
                    style={{
                      animationDelay: `${i * 0.5}s`,
                      transform: `rotate(${i * 60}deg) translateX(140px)`
                    }}
                  />
                ))}
              </div>
            </div>
            
            <span className={`mt-4 text-white text-lg font-semibold group-hover:text-blue-300 transition-all duration-500 transform ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ 
              animationDelay: '0.8s',
              textShadow: '0 0 10px rgba(255,255,255,0.3)'
            }}>
              Science Clubs
            </span>
          </Link>

          {/* Cultural Club */}
          <Link
            href={`/dashboard/${studentId}/clubs/cultural`}
            className="flex flex-col items-center group relative"
          >
            <div className={`transform transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0 scale-100 rotate-0' : 'opacity-0 translate-y-20 scale-50 rotate-180'
            }`}
            style={{ animationDelay: '0.7s' }}>
              {/* Magical circle border */}
              <div className="absolute inset-0 w-80 h-80 rounded-full border-2 border-pink-400/30 animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 w-80 h-80 rounded-full border border-pink-300/20 animate-pulse" />
              
              {/* Main club circle */}
              <div className="w-70 h-70 rounded-full overflow-hidden border-4 border-white group-hover:border-pink-400 shadow-2xl transition-all duration-500 relative animate-float-gentle group-hover:scale-110 group-hover:shadow-pink-500/50" style={{ animationDelay: '1s' }}>
                <Image
                  src="/images/clubs/cultural.jpg"
                  alt="Cultural Clubs"
                  fill
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              {/* Glowing orbs around the circle */}
              <div className="absolute inset-0 w-80 h-80 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 bg-pink-400 rounded-full animate-orbit"
                    style={{
                      animationDelay: `${i * 0.5}s`,
                      transform: `rotate(${i * 60}deg) translateX(140px)`
                    }}
                  />
                ))}
              </div>
            </div>
            
            <span className={`mt-4 text-white text-lg font-semibold group-hover:text-pink-300 transition-all duration-500 transform ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ 
              animationDelay: '1s',
              textShadow: '0 0 10px rgba(255,255,255,0.3)'
            }}>
              Cultural Clubs
            </span>
          </Link>

          {/* Welfare Club */}
          <Link
            href={`/dashboard/${studentId}/clubs/welfare`}
            className="flex flex-col items-center group relative"
          >
            <div className={`transform transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0 scale-100 rotate-0' : 'opacity-0 translate-y-20 scale-50 rotate-180'
            }`}
            style={{ animationDelay: '0.9s' }}>
              {/* Magical circle border */}
              <div className="absolute inset-0 w-80 h-80 rounded-full border-2 border-green-400/30 animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 w-80 h-80 rounded-full border border-green-300/20 animate-pulse" />
              
              {/* Main club circle */}
              <div className="w-70 h-70 rounded-full overflow-hidden border-4 border-white group-hover:border-green-400 shadow-2xl transition-all duration-500 relative animate-float-gentle group-hover:scale-110 group-hover:shadow-green-500/50" style={{ animationDelay: '2s' }}>
                <Image
                  src="/images/clubs/welfare.jpg"
                  alt="Welfare Clubs"
                  fill
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              {/* Glowing orbs around the circle */}
              <div className="absolute inset-0 w-80 h-80 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 bg-green-400 rounded-full animate-orbit"
                    style={{
                      animationDelay: `${i * 0.5}s`,
                      transform: `rotate(${i * 60}deg) translateX(140px)`
                    }}
                  />
                ))}
              </div>
            </div>
            
            <span className={`mt-4 text-white text-lg font-semibold group-hover:text-green-300 transition-all duration-500 transform ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ 
              animationDelay: '1.2s',
              textShadow: '0 0 10px rgba(255,255,255,0.3)'
            }}>
              Welfare Clubs
            </span>
          </Link>

          {/* Other Clubs */}
          {/*<Link
            href={`/dashboard/${studentId}/clubs/other`}
            className="flex flex-col items-center group relative"
          >
            <div className={`transform transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0 scale-100 rotate-0' : 'opacity-0 translate-y-20 scale-50 rotate-180'
            }`}
            style={{ animationDelay: '1.1s' }}>
              {/* Magical circle border 
              <div className="absolute inset-0 w-80 h-80 rounded-full border-2 border-orange-400/30 animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 w-80 h-80 rounded-full border border-orange-300/20 animate-pulse" />
              
              {/* Main club circle 
              <div className="w-70 h-70 rounded-full overflow-hidden border-4 border-white group-hover:border-orange-400 shadow-2xl transition-all duration-500 relative animate-float-gentle group-hover:scale-110 group-hover:shadow-orange-500/50" style={{ animationDelay: '3s' }}>
                <img
                  src="/images/clubs/other.jpg"
                  alt="Other Clubs"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Hover overlay 
                <div className="absolute inset-0 bg-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              {/* Glowing orbs around the circle 
              <div className="absolute inset-0 w-80 h-80 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 bg-orange-400 rounded-full animate-orbit"
                    style={{
                      animationDelay: `${i * 0.5}s`,
                      transform: `rotate(${i * 60}deg) translateX(140px)`
                    }}
                  />
                ))}
              </div>
            </div>
            
            <span className={`mt-4 text-white text-lg font-semibold group-hover:text-orange-300 transition-all duration-500 transform ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ 
              animationDelay: '1.4s',
              textShadow: '0 0 10px rgba(255,255,255,0.3)'
            }}>
              Other Clubs
            </span>
          </Link>*/}
        </div>

        {/* Bottom magical glow */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-900/30 to-transparent opacity-60" />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(140px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(140px) rotate(-360deg); }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-float-gentle {
          animation: float-gentle 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-orbit {
          animation: orbit 4s linear infinite;
        }
      `}</style>
    </DashboardLayout>
  );
}
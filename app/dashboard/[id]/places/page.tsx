'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const places = [
  { id: 'main', name: 'MAIN GATE', top: '52%', left: '31%' },
  { id: 'indoor', name: 'Indoor Stadium Area', top: '60%', left: '38%' },
  { id: 'mess', name: 'CDH2', top: '66%', left: '49%' },
  { id: 'anamudi', name: 'Anamudi block', top: '73%', left: '49%' },
  { id: 'phd-hostels', name: 'PHD hostels', top: '42%', left: '58%' },
  { id: 'cdh1', name: 'CDH1', top: '36%', left: '62%' },
  { id: 'cake-world', name: 'Cake World', top: '24%', left: '58%' },
  { id: 'tasty', name: 'Tasty', top: '24%', left: '47%' },
  { id: 'red-cafe', name: 'Red Cafe', top: '17%', left: '57%' },
  { id: 'msb', name: 'MSB', top: '5%', left: '47%' },
  { id: 'lhc', name: 'LHC', top: '4%', left: '55%' },
  { id: 'psb', name: 'PSB', top: '11%', left: '55%' },
  { id: 'library', name: 'Library', top: '16%', left: '43%' },
  { id: 'csb', name: 'CSB', top: '15%', left: '63%' },
  { id: 'bsb', name: 'BSB', top: '20%', left: '70%' },
  { id: 'health', name: 'Guest house', top: '9%', left: '40%' },
  { id: 'kathinpara', name: 'Way to Kathinpara', top: '0%', left: '38%' }
];

export default function PlacesPage() {
  const { id: studentId } = useParams();
  const [loadedMarkers, setLoadedMarkers] = useState(new Set());
  const [hasAnimated, setHasAnimated] = useState(false);


  useEffect(() => {
    // Check if animations have been shown before in this session
    const animationShown = sessionStorage.getItem('campusMapAnimationShown');
    
    if (!animationShown) {
      // First visit - show staggered animation
      places.forEach((_, index) => {
        setTimeout(() => {
          setLoadedMarkers(prev => new Set([...prev, index]));
        }, index * 150); // 150ms delay between each marker
      });
      
      // Mark animation as shown and set all markers as loaded after animation completes
      setTimeout(() => {
        setHasAnimated(true);
        sessionStorage.setItem('campusMapAnimationShown', 'true');
      }, places.length * 150 + 500);
    } else {
      // Subsequent visits - show all markers immediately without animation
      setLoadedMarkers(new Set(places.map((_, index) => index)));
      setHasAnimated(true);
    }
  }, []);

  return (
    <DashboardLayout>
      <div className="relative w-full h-full">
        {/* Main Background */}
        <div
          className="relative w-full h-full bg-cover bg-center rounded-2xl overflow-hidden"
          style={{ backgroundImage: "url('/images/iiser.jpg')" }}
        >
          {/* Title Header */}
          <div className="absolute top-6 left-6 z-20">
            <h1 className="text-3xl md:text-5xl font-bold text-white text-left drop-shadow-lg">
              📍 Campus Map
            </h1>
          </div>

          {/* Place Markers with Pop-up Animation and Pulsating Circles */}
          {places.map((place, index) => (
            <div
              key={place.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                loadedMarkers.has(index) 
                  ? 'opacity-100 scale-100 translate-y-0' 
                  : 'opacity-0 scale-0 translate-y-4'
              }`}
              style={{ 
                top: place.top, 
                left: place.left,
                transitionDelay: `${index * 50}ms`
              }}
            >
              {/* Pulsating Circle */}
              <div className="absolute -left-6 top-1/2 transform -translate-y-1/2">
                <div className="w-3 h-3 bg-orange-600 rounded-full pulse-circle"></div>
              </div>
              
              {/* Place Link */}
              <Link 
                href={`/dashboard/${studentId}/places/${place.id}`} 
                className="block px-3 py-2 bg-yellow-400 text-black font-medium rounded-lg shadow-lg border-2 border-yellow-500 hover:bg-yellow-300 hover:scale-110 transition-all duration-300 text-sm whitespace-nowrap"
              >
                {place.name}
              </Link>
                 
              
            </div>
          ))}

          <div className="absolute bottom-7 left-0 w-full text-center">
                <p className="text-gray-300 text-sm">
                  Click the place names to visit theit info page. On the info page, click the pulsating description box for more images.
                </p>
              </div>

          {!hasAnimated && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/60 backdrop-blur-sm rounded-full px-6 py-2 text-white text-sm">
                Places loaded: {loadedMarkers.size}/{places.length}
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes popIn {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0) translateY(20px);
            }
            80% {
              transform: translate(-50%, -50%) scale(1.1) translateY(-5px);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1) translateY(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.2);
            }
          }

          .pulse-circle {
            animation: pulse 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}
'use client';
import { useState } from 'react';
import Image from 'next/image';

const CulturalClubs = [
  {
    name: 'Dance Society',
    role: 'Dance',
    img: '/images/clubs/dance.jpeg', // Replace with your actual image filename
    desc: 'For the Dancers',
    whatsapp:'',
    insta: 'https://www.instagram.com/dancesociety.iisertvm?igsh=MXNraDNpczFkODJpbQ==',
    gradient: 'bg-gradient-to-b from-yellow-200 to-yellow-100'
  },
  {
    name: 'Music Club',
    role: 'Music',
    img: '/images/clubs/music.jpeg', // Replace with your actual image filename
    desc: 'For the Singers and Musicians',
    whatsapp:'',
    insta: 'https://www.instagram.com/musicclub.iisertvm?igsh=a3VsaG14Zmh6NXlh',
    gradient: 'bg-gradient-to-b from-pink-200 to-pink-100'
  },
  {
    name: 'Movie Club',
    role: 'Movies',
    img: '/images/clubs/movie.jpeg', // Replace with your actual image filename
    desc: 'For the cinema lovers',
    whatsapp:'',
    insta: 'https://www.instagram.com/movieclub.iisertvm?igsh=MXVjY2kxMnVnczA4bg==',
    gradient: 'bg-gradient-to-b from-blue-200 to-blue-100'
  },
  {
    name: 'Media Society',
    role: 'Photos & videos',
    img: '/images/clubs/media.jpeg', // Replace with your actual image filename
    desc: 'For the Photophiles',
    whatsapp:'',
    insta: 'https://www.instagram.com/mediasociety.iisertvm?igsh=Z2Z4M3ZuZXVqejM3',
    gradient: 'bg-gradient-to-b from-orange-200 to-orange-100'
  },
  {
    name: 'Theatrics Society',
    role: 'Theatre',
    img: '/images/clubs/theatrics.jpeg', // Replace with your actual image filename
    desc: 'For the theatre lovers',
    whatsapp:'',
    insta: 'https://www.instagram.com/theatricssociety_iisertvm?igsh=MWtyeWFzYWExNHk3Zw==',
    gradient: 'bg-gradient-to-b from-purple-200 to-purple-100'
  },
  {
    name: 'ISLA',
    role: 'Literature & Fine Arts',
    img: '/images/clubs/isla.jpeg', // Replace with your actual image filename
    desc: 'For the literature lovers and artists',
    whatsapp:'',
    insta: 'https://www.instagram.com/isla.iisertvm?igsh=YWY2aW9za3dsZ2V2',
    gradient: 'bg-gradient-to-b from-gray-300 to-gray-200'
  },
  {
    name: 'HCIT',
    role: 'Humanities Collective',
    img: '/images/clubs/hum.jpeg', // Replace with your actual image filename
    desc: 'For the debate lovers',
    whatsapp:'',
    insta: 'https://www.instagram.com/hcit_iisertvm?igsh=MTRkMDJjYnA5d3Jwbw==',
    gradient: 'bg-gradient-to-b from-green-200 to-green-100'
  },

];

export default function CClubs() {
  const [selectedClub, setSelectedClub] = useState<number | null>(null);
  const [hoveredClub, setHoveredClub] = useState<number | null>(null);

  const handleClubClick = (index: number) => {
    setSelectedClub(selectedClub === index ? null : index);
  };

  const handleClubHover = (index: number) => {
    if (selectedClub === null) {
      setHoveredClub(index);
    }
  };

  const handleClubLeave = () => {
    setHoveredClub(null);
  };

  const getCardTransform = (index: number) => {
    const totalCards = CulturalClubs.length;
    const centerIndex = (totalCards - 1) / 2;
    
    if (selectedClub !== null) {
      // When a card is selected, adjust positioning to prevent overlap
      const expandedCardWidth = 320;
      const normalCardWidth = 224;
      const widthDifference = expandedCardWidth - normalCardWidth;
      
      if (index === selectedClub) {
        // Selected card stays in its original position
        const baseOffset = (index - centerIndex) * 120;
        return `translateX(${baseOffset}px)`;
      } else if (index > selectedClub) {
        // Cards to the right of selected card are pushed further right
        const baseOffset = (index - centerIndex) * 120;
        const pushOffset = widthDifference * 0.8; // Adjust this multiplier as needed
        return `translateX(${baseOffset + pushOffset}px)`;
      } else {
        // Cards to the left remain in original positions
        const baseOffset = (index - centerIndex) * 120;
        return `translateX(${baseOffset}px)`;
      }
    }
    
    // Default overlapping layout when no card is selected
    const baseOffset = (index - centerIndex) * 120;
    return `translateX(${baseOffset}px)`;
  };

  const getZIndex = (index: number) => {
    if (selectedClub === index) return 50;
    if (hoveredClub === index) return 30;
    return 10 + index;
  };

  const getCardScale = (index: number) => {
    if (selectedClub === index) return 'scale(1.1)';
    if (hoveredClub === index && selectedClub === null) return 'scale(1.05)';
    return 'scale(1)';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-16 px-4">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-block">
          <span className="text-red-500 text-sm font-semibold tracking-wider uppercase">Cultural</span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mt-2 mb-4">
            CLUBS OF IISER TVM
          </h1>
          <p className="text-gray-400 text-lg">Discover the creative spirits of our campus</p>
        </div>
      </div>

      {/* Clubs Cards Container */}
      <div className="flex justify-center items-center min-h-[600px] max-w-7xl mx-auto relative overflow-hidden">
        {CulturalClubs.map((club, index) => (
          <div
            key={index}
            className="absolute transition-all duration-700 ease-out"
            style={{
              transform: `${getCardTransform(index)} ${getCardScale(index)}`,
              zIndex: getZIndex(index),
              filter: selectedClub === index ? 'drop-shadow(0 15px 50px rgba(255,255,255,0.25))' : 'none'
            }}
          >
            {/* Club Card */}
            <div
              className="cursor-pointer transition-all duration-700 ease-out"
              onClick={() => handleClubClick(index)}
              onMouseEnter={() => handleClubHover(index)}
              onMouseLeave={handleClubLeave}
            >
              {/* Card Background with Image */}
              <div 
                className="rounded-3xl shadow-2xl transition-all duration-700 ease-out relative overflow-hidden"
                style={{
                  width: selectedClub === index ? '320px' : '224px',
                  height: selectedClub === index ? '520px' : '384px',
                }}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src={club.img}
                    alt={club.name}
                    fill
                    className=" object-cover transition-transform duration-300 ease-out hover:scale-105"
                  />
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/40 transition-all duration-300 ease-out"></div>
                </div>

                {/* Content Container */}
                <div className="relative z-10 p-6 h-full flex flex-col">
                  {/* Header Section */}
                  <div className="text-center mb-auto">
                    <h3 className={`font-bold text-white drop-shadow-lg transition-all duration-300 ease-out ${
                      selectedClub === index ? 'text-2xl mb-2' : 'text-lg mb-1'
                    }`}>
                      {club.name}
                    </h3>
                    <p className={`text-white/90 font-medium drop-shadow-md transition-all duration-300 ease-out ${
                      selectedClub === index ? 'text-base' : 'text-sm'
                    }`}>
                      {club.role}
                    </p>
                  </div>

                  {/* Expanded Content */}
                  <div className={`text-center transition-all duration-500 ease-out ${
                    selectedClub === index 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}>
                    <p className="text-white text-lg italic mb-6 leading-relaxed drop-shadow-md">
                      {club.desc}
                    </p>
                    <div className="flex justify-center gap-4">
                      {/* Instagram Button */}
                      <a
                        href={club.insta}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 ease-out transform hover:scale-110 shadow-lg hover:shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                          className="transition-transform duration-300 ease-out"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                      
                      {/* WhatsApp Button */}
                      <a
                        href={club.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 ease-out transform hover:scale-110 shadow-lg hover:shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                          className="transition-transform duration-300 ease-out"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.569-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Hover Indicator */}
                {hoveredClub === index && selectedClub === null && (
                  <div className="absolute inset-0 rounded-3xl border-2 border-white/50 animate-pulse"></div>
                )}
              </div>

              {/* Glow Effect for Selected */}
              {selectedClub === index && (
                <div className="absolute inset-0 rounded-3xl bg-white/10 blur-xl -z-10 transition-opacity duration-500 ease-out"></div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="text-center mt-12">
        <p className="text-gray-400 text-sm">
         Whatsapp groups are not yet available for joining
        </p>
        <p className="text-gray-400 text-sm">
          Hover to preview. Click to expand. Click again to collapse
        </p>
      </div>
    </div>
  );
}
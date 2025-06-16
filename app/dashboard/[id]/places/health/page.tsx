'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';

export default function Indoor() {
  const [expandedPlace, setExpandedPlace] = useState<number | null>(null);
  const router = useRouter();
  const places = [
    {
      name: "Statue",
      image: "/images/nearby/statue.jpeg",
      description: "An iconic statue on the campus"
    },
    {
      name: "Bridge",
      image: "/images/cafeteria.jpg", 
      description: "Modern dining facility serving fresh meals and snacks"
    },
    {
      name: "Way to cake-world",
      image: "/images/nearby/to-cw.jpeg",
      description: "This roads lead to the library, tasty, cake world and places nearby"
    },

  ];

  const togglePlace = (index: number) => {
    setExpandedPlace(expandedPlace === index ? null : index);
  };

  const handleTextClick = () => {
    // Navigate to indoor_images page
    router.push('health/more')
  };

  return (
    <DashboardLayout>
      <div
        className="h-full w-full bg-cover bg-center rounded-2xl flex"
        style={{ backgroundImage: "url('/images/indoor.jpg')" }}>
        
        {/* Places nearby tree structure - Left side */}
        <div className="flex-1 flex items-center justify-start pl-8">
          <div className="w-100">
            <div className="text-white text-3xl font-bold mb-6 border-l-4 border-blue-400 pl-4">
              Places Nearby
            </div>
            
            <div className="space-y-1 pl-4 border-l-2 border-gray-600">
              {places.map((place, index) => (
                <div key={index}>
                  {/* Place name - clickable */}
                  <div 
                    className="text-white cursor-pointer hover:text-blue-300 transition-colors duration-200 flex items-center py-1"
                    onClick={() => togglePlace(index)}
                  >
                    <span className="mr-3 text-sm transform transition-transform duration-300 ease-in-out">
                      {expandedPlace === index ? '▼' : '▶'}
                    </span>
                    <span className="text-lg">{place.name}</span>
                  </div>
                  
                  {/* Expanded content with animation */}
                  <div 
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      expandedPlace === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="ml-8 mt-3 mb-4 transform transition-all duration-500 ease-in-out">
                      <div 
                        className="relative w-80 h-40 bg-cover bg-center rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-130"
                        style={{ backgroundImage: `url('${place.image}')` }}
                      >
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-4">
                          <p className="text-white text-sm text-center font-medium">
                            {place.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main text container - Right side */}
        <div className="flex-1 flex items-center justify-center">
          <div 
            className="bg-black/60 rounded-2xl p-6 mx-6 text-white text-center text-3xl font-semibold max-w-3xl cursor-pointer hover:bg-black/70 transition-all duration-300 animate-pulse"
            onClick={handleTextClick}
          >
            This is the guest house: you can also book it sometimes for your parents, if they come to visit you
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
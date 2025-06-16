'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Home, MapPin, Users, Flame, Settings } from 'lucide-react';
import { useRouter, useParams, usePathname } from 'next/navigation';

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const router = useRouter();
  const { id: studentId } = useParams();
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeButton, setActiveButton] = useState('');

  // Extract current page from pathname
  useEffect(() => {
    if (pathname) {
      const pathParts = pathname.split('/');
      const currentPage = pathParts[pathParts.length - 1];
      setActiveButton(currentPage);
    }
  }, [pathname]);

  const goTo = async (path: string) => {
    if (!studentId || isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Small delay for smooth transition effect
    setTimeout(() => {
      router.push(`/dashboard/${studentId}/${path}`);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 150);
    }, 100);
  };

  const navItems = [
    { id: 'overview', icon: Home },
    { id: 'places', icon: MapPin },
    { id: 'clubs', icon: Users },
    { id: 'freshers', icon: Flame },
    { id: 'settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-20 flex flex-col items-center justify-center space-y-6 relative">
        {/* Active indicator background */}
        <div 
          className="absolute w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-20 transition-all duration-300 ease-out"
          style={{
            transform: `translateY(${navItems.findIndex(item => item.id === activeButton) * 72 - (navItems.length - 1) * 36}px)`,
            opacity: activeButton ? 0.3 : 0
          }}
        />
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeButton === item.id;
          
          return (
            <button
              key={item.id}
              className={`
                relative text-white p-3 rounded-xl transition-all duration-300 ease-out
                transform hover:scale-110 hover:-translate-y-1
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25' 
                  : 'hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-800/50'
                }
                ${isTransitioning ? 'pointer-events-none' : ''}
                group
              `}
             
              onClick={() => goTo(item.id)}
            >
              <Icon 
                size={24} 
                className={`
                  transition-all duration-300 ease-out
                  ${isActive ? 'text-white drop-shadow-sm' : 'text-gray-300 group-hover:text-white'}
                `}
              />
              
              {/* Hover tooltip */}
              <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg" style={{ zIndex: 9999 }}>
  
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </button>
          );
        })}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 relative">
        {/* Content wrapper with transition */}
        <div 
          className={`
            bg-white rounded-3xl shadow-2xl w-full h-full relative overflow-hidden
            transition-all duration-300 ease-out
            ${isTransitioning ? 'opacity-95 scale-[0.998]' : 'opacity-100 scale-100'}
          `}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          {/* Loading overlay during transitions */}
          {isTransitioning && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          {/* Content */}
          <div 
            className={`
              h-full transition-all duration-200 ease-out
              ${isTransitioning ? 'opacity-70 blur-sm' : 'opacity-100 blur-0'}
            `}
          >
            {children}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-xl -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full blur-xl -z-10 animate-pulse" style={{ animationDelay: '2s' }} />
      </main>
    </div>
  );
}
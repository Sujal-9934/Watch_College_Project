import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const CelebrityLook = () => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const celebrityLooks = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      celebrity: 'Shah Rukh Khan',
      brand: 'My Clock X Jawan',
      link: '/products?celebrity=1',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      celebrity: 'Ananya Pandey',
      brand: 'My Clock Collection',
      link: '/products?celebrity=2',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      celebrity: 'Shubman Gill',
      brand: 'G-SHOCK X SHUBMAN GILL',
      link: '/products?celebrity=3',
    },
  ];

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };
    checkScroll();
    const interval = setInterval(checkScroll, 100);
    return () => clearInterval(interval);
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">SHOP THE CELEBRITY LOOK</h2>
        
        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {celebrityLooks.map((look) => (
              <Link
                key={look.id}
                to={look.link}
                className="flex-shrink-0 group"
              >
                <div className="w-80 h-96 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 relative">
                  <img
                    src={look.image}
                    alt={look.celebrity}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-lg font-semibold mb-1">{look.celebrity}</p>
                    <p className="text-sm text-gray-200">{look.brand}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-700" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default CelebrityLook;


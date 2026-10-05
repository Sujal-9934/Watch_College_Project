import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const OffersForYou = () => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const offers = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Special Offer 1',
      link: '/products?offer=1',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Special Offer 2',
      link: '/products?offer=2',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Special Offer 3',
      link: '/products?offer=3',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Special Offer 4',
      link: '/products?offer=4',
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Special Offer 5',
      link: '/products?offer=5',
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Special Offer 6',
      link: '/products?offer=6',
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
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">OFFERS FOR YOU</h2>
        
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
            {offers.map((offer) => (
              <Link
                key={offer.id}
                to={offer.link}
                className="flex-shrink-0 group"
              >
                <div className="w-80 h-64 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
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

export default OffersForYou;


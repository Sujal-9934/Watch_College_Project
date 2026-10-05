import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBrands } from '../../redux/slices/brandSlice';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const MostLovedBrands = () => {
  const dispatch = useDispatch();
  const { brands, loading } = useSelector((state) => state.brands);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

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
  }, [brands]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">MOST LOVED BRANDS</h2>
            <p className="text-blue-200">Latest & Trending Watch Collections</p>
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-64 h-32 bg-blue-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Sort brands by product count (most loved)
  const sortedBrands = [...brands]
    .filter(brand => brand.product_count > 0)
    .sort((a, b) => b.product_count - a.product_count)
    .slice(0, 8);

  return (
    <section className="py-16 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl font-bold mb-3">MOST LOVED BRANDS</h2>
          <p className="text-blue-200 text-lg">Latest & Trending Watch Collections</p>
        </div>
        
        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-md rounded-full p-3 hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-xl"
            >
              <ChevronLeftIcon className="h-6 w-6 text-white" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {sortedBrands.map((brand, index) => (
              <Link
                key={brand.id}
                to={`/products?brand=${brand.slug}`}
                className="flex-shrink-0 group animate-fade-in-up hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-72 bg-white/10 backdrop-blur-md rounded-xl p-8 hover:bg-white/20 transition-all duration-500 border-2 border-white/20 hover:border-white/40 hover:shadow-2xl">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-yellow-300 transition-colors duration-300">
                    {brand.name}
                  </h3>
                  <p className="text-blue-200 text-base font-semibold">
                    {brand.min_price 
                      ? `STARTING FROM ₹${parseInt(brand.min_price).toLocaleString('en-IN')}`
                      : 'Explore Collection'}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-md rounded-full p-3 hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-xl"
            >
              <ChevronRightIcon className="h-6 w-6 text-white" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default MostLovedBrands;


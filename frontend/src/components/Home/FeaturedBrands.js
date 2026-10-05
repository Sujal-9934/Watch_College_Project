import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBrands } from '../../redux/slices/brandSlice';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const FeaturedBrands = () => {
  const dispatch = useDispatch();
  const { brands, loading, error } = useSelector((state) => state.brands);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    if (brands.length === 0) {
      dispatch(fetchBrands());
    }
  }, [dispatch, brands.length]);

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
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Generate random tags for brands
  const getTag = (index) => {
    const tags = ['NEW', 'TRENDING', 'SALE'];
    return tags[index % tags.length];
  };

  const getTagColor = (tag) => {
    switch (tag) {
      case 'NEW':
        return 'bg-green-500';
      case 'TRENDING':
        return 'bg-orange-500';
      case 'SALE':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Brands</h2>
          <div className="flex gap-6 overflow-hidden justify-center">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-32 h-32 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Brands</h2>
          <div className="text-center text-gray-500">
            <p>Unable to load brands. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!brands || brands.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Brands</h2>
          <div className="text-center text-gray-500">
            <p>No brands available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  const displayBrands = brands.slice(0, 12);

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center animate-fade-in-up">
          Featured Brands
        </h2>
        
        {displayBrands.length > 0 ? (
          <div className="relative">
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl rounded-full p-3 hover:bg-gray-50 transition-all duration-300 hover:scale-110 hover-glow"
                aria-label="Scroll left"
              >
                <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
              </button>
            )}

            <div
              ref={scrollRef}
              className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth px-2 justify-center md:justify-start"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {displayBrands.map((brand, index) => (
                <div
                  key={brand.id}
                  className="flex-shrink-0 group relative flex flex-col items-center animate-fade-in-up hover-lift"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Link
                    to={`/products?brand=${brand.slug || brand.id}`}
                    className="flex flex-col items-center"
                  >
                    <div className="w-36 h-36 rounded-full bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 group-hover:border-primary-500 transition-all duration-500 flex items-center justify-center shadow-lg group-hover:shadow-2xl relative overflow-hidden hover:scale-110">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name || 'Brand'}
                          className="w-24 h-24 object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.parentElement.querySelector('.brand-fallback');
                            if (fallback) fallback.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <span 
                        className="text-5xl brand-fallback transition-transform duration-500 group-hover:scale-110" 
                        style={{ display: brand.logo ? 'none' : 'block' }}
                      >
                        ⌚
                      </span>
                      
                      {/* Tag */}
                      <span
                        className={`absolute top-0 right-0 ${getTagColor(getTag(index))} text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl shadow-lg animate-bounce-in`}
                        style={{ animationDelay: `${index * 0.15}s` }}
                      >
                        {getTag(index)}
                      </span>
                    </div>
                    <p className="text-center mt-3 text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors duration-300 w-36">
                      {brand.name || 'Brand'}
                    </p>
                  </Link>
                </div>
              ))}
            </div>

            {canScrollRight && displayBrands.length > 4 && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl rounded-full p-3 hover:bg-gray-50 transition-all duration-300 hover:scale-110 hover-glow"
                aria-label="Scroll right"
              >
                <ChevronRightIcon className="h-6 w-6 text-gray-700" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 animate-fade-in">
            <p>No brands available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedBrands;


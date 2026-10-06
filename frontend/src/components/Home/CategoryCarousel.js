import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../redux/slices/categorySlice';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const CategoryCarousel = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.categories);
  const categories = useSelector((state) => (
    Array.isArray(state.categories?.categories) ? state.categories.categories : []
  ));
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    dispatch(fetchCategories());
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
  }, [categories]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">SHOP BY CATEGORY</h2>
          <div className="flex gap-6 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-80 h-96 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayCategories = (categories || []).slice(0, 6);

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center animate-fade-in-up">
          SHOP BY CATEGORY
        </h2>
        
        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl rounded-full p-3 hover:bg-gray-50 transition-all duration-300 hover:scale-110 hover-glow"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayCategories.map((category, index) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="flex-shrink-0 group animate-fade-in-up hover-lift"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="w-80 h-96 rounded-2xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500 relative">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <span className="text-7xl animate-pulse">⌚</span>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-500" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform group-hover:translate-y-0 translate-y-2 transition-all duration-500">
                    <h3 className="text-3xl font-bold mb-3 group-hover:scale-105 transition-transform duration-300">
                      {category.name.toUpperCase()}
                    </h3>
                    <p className="text-xl font-semibold">
                      {category.min_price 
                        ? `₹${parseInt(category.min_price).toLocaleString('en-IN')} ONWARDS`
                        : 'Explore Collection'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl rounded-full p-3 hover:bg-gray-50 transition-all duration-300 hover:scale-110 hover-glow"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-700" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryCarousel;

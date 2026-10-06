import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import ProductCard from '../Product/ProductCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const NewArrivals = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 20, sort: 'created_at', order: 'desc' }));
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
  }, [products, activeFilter]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const filteredProducts = products.filter((product) => {
    if (activeFilter === 'ALL') return true;
    const categoryName = product.category_name?.toUpperCase() || '';
    if (activeFilter === 'MEN') {
      return categoryName.includes('MEN') || categoryName.includes('MENS');
    }
    if (activeFilter === 'WOMEN') {
      return categoryName.includes('WOMEN') || categoryName.includes('WOMENS');
    }
    if (activeFilter === 'UNISEX') {
      return categoryName.includes('UNISEX') || categoryName.includes('UNI-SEX');
    }
    return true;
  });

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center animate-fade-in-up">
          NEW ARRIVALS
        </h2>
        
        {/* Filter Buttons */}
        <div className="flex justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {['ALL', 'MEN', 'WOMEN', 'UNISEX'].map((filter, index) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-8 py-3 rounded-full font-bold transition-all duration-500 transform hover:scale-110 ${
                activeFilter === filter
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-xl scale-110 animate-bounce-in'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {filter}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-64 h-96 bg-gray-200 rounded-lg skeleton animate-shimmer" />
            ))}
          </div>
        ) : (
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
              className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredProducts.slice(0, 12).map((product, index) => (
                <div key={product.id} className="flex-shrink-0 w-72 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ProductCard product={product} index={index} />
                </div>
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
        )}
      </div>
    </section>
  );
};

export default NewArrivals;

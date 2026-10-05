import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchActiveSliders } from '../../redux/slices/homepageSlice';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const CinematicHero = () => {
  const dispatch = useDispatch();
  const { sliders, loading } = useSelector((state) => state.homepage);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const defaultSlides = [
    {
      id: 'default-1',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=2000&q=100&auto=format&fit=crop',
      title: 'Time Crafted in Perfection',
      description: 'Luxury Watches Collection',
      buttonText: 'Explore Collection',
      link: '/products'
    },
    {
      id: 'default-2',
      image_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=2000&q=100&auto=format&fit=crop',
      title: 'Swiss Made Movement',
      description: 'Precision Engineering',
      buttonText: 'Shop Now',
      link: '/products'
    },
    {
      id: 'default-3',
      image_url: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=2000&q=100&auto=format&fit=crop',
      title: 'Timeless Design',
      description: 'Infinite Variations',
      buttonText: 'View Collection',
      link: '/products'
    },
    {
      id: 'default-4',
      image_url: 'https://images.unsplash.com/photo-1547996160-81dfa63595dd?w=2000&q=100&auto=format&fit=crop',
      title: 'Lifestyle Redefined',
      description: 'Where luxury meets elegance',
      buttonText: 'Discover More',
      link: '/products'
    }
  ];

  const activeSlides = sliders && sliders.length > 0 ? sliders : defaultSlides;

  useEffect(() => {
    dispatch(fetchActiveSliders());
  }, [dispatch]);

  // Auto slide functionality
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [activeSlides.length]);

  const goToSlide = (index) => {
    setCurrentSlideIndex(index);
  };

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Slider Container */}
      <div className="relative w-full h-full">
        {activeSlides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlideIndex ? 'opacity-100' : 'opacity-0'
              }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={slide.image_url || slide.image}
                alt={slide.title}
                className="w-full h-full object-cover transform scale-105"
                style={{
                   transition: 'transform 10s linear',
                   transform: index === currentSlideIndex ? 'scale(1.15)' : 'scale(1)'
                }}
                loading={index === 0 ? 'eager' : 'lazy'}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=2000&q=100&auto=format&fit=crop';
                }}
              />
              {/* Dark Overlay with Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className={`text-center px-4 sm:px-6 lg:px-8 max-w-4xl transition-all duration-1000 transform ${
                index === currentSlideIndex ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
                  {slide.title}
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-10 font-light max-w-2xl mx-auto leading-relaxed">
                  {slide.description || slide.subtitle}
                </p>
                <Link
                  to={slide.link || slide.button_link || '/products'}
                  className="inline-flex items-center gap-3 bg-white text-black hover:bg-amber-500 hover:text-white px-10 py-4 rounded-full text-lg font-bold transition-all duration-300 shadow-2xl hover:scale-105"
                >
                  {slide.buttonText || 'Discover Now'}
                  <ChevronRightIcon className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-amber-500 text-white backdrop-blur-md rounded-full p-4 transition-all duration-300 border border-white/10 group"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="h-6 w-6 group-hover:scale-110" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-amber-500 text-white backdrop-blur-md rounded-full p-4 transition-all duration-300 border border-white/10 group"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="h-6 w-6 group-hover:scale-110" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-4">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${index === currentSlideIndex
                  ? 'w-12 bg-amber-500'
                  : 'w-4 bg-white/30 hover:bg-white/60'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CinematicHero;


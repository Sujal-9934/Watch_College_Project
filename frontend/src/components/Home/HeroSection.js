import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { fetchActiveSliders } from '../../redux/slices/homepageSlice';

const HeroSection = () => {
  const dispatch = useDispatch();
  const sliders = useSelector((state) => (
    Array.isArray(state.homepage?.sliders) ? state.homepage.sliders : []
  ));
  const watchRef = useRef(null);
  const particlesRef = useRef(null);

  const defaultSliders = [
    {
      id: 1,
      title: 'Time That Defines Your Style',
      subtitle: 'Crafted with precision, designed for eternity',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      button_text: 'Shop Now',
      button_link: '/products',
    },
  ];

  const backgroundImages = (sliders || []).length > 0
    ? [...sliders].sort((a, b) => a.display_order - b.display_order)
    : defaultSliders;

  useEffect(() => {
    dispatch(fetchActiveSliders());
  }, [dispatch]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = watchRef.current?.getBoundingClientRect();
      if (rect) {
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Create floating particles
  useEffect(() => {
    if (!particlesRef.current) return;

    const particles = [];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'luxury-particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particle.style.animationDuration = `${10 + Math.random() * 10}s`;
      particlesRef.current.appendChild(particle);
    }

    return () => {
      particles.forEach(p => p.remove());
    };
  }, []);

  const currentSlider = backgroundImages[0] || defaultSliders[0];

  return (
    <section className="relative h-screen min-h-[800px] overflow-hidden bg-gradient-to-br from-black via-slate-900 to-blue-950">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 via-blue-950 to-black animate-gradient-shift"></div>

      {/* Light Streaks */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="luxury-light-streak streak-1"></div>
        <div className="luxury-light-streak streak-2"></div>
        <div className="luxury-light-streak streak-3"></div>
      </div>

      {/* Floating Particles Container */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none"></div>

      {/* Ambient Glow Effect */}
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-transparent to-transparent"></div>

      {/* Main Content Container */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          
          {/* Left Side - Text Content */}
          <div className={`text-white z-10 space-y-8 ${isLoaded ? 'animate-luxury-fade-in-up' : 'opacity-0'}`}>
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-block">
                <div className="glassmorphism-card px-6 py-2 rounded-full border border-amber-500/30 backdrop-blur-xl">
                  <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase">
                    Premium Collection
                  </span>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light leading-tight">
                <span className="block text-white mb-2 animate-luxury-slide-up">
                  {currentSlider.title?.split(' ').slice(0, 2).join(' ') || 'Time That'}
                </span>
                <span className="block bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 bg-clip-text text-transparent animate-luxury-slide-up" style={{ animationDelay: '0.2s' }}>
                  {currentSlider.title?.split(' ').slice(2).join(' ') || 'Defines Your Style'}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-300 font-light max-w-xl leading-relaxed animate-luxury-slide-up" style={{ animationDelay: '0.4s' }}>
                {currentSlider.subtitle || 'Crafted with precision, designed for eternity. Experience luxury redefined.'}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-luxury-slide-up" style={{ animationDelay: '0.6s' }}>
                <Link
                  to={currentSlider.button_link || '/products'}
                  className="group relative overflow-hidden"
                >
                  <div className="luxury-button-primary">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {currentSlider.button_text || 'Shop Now'}
                      <ChevronRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 luxury-button-glow"></div>
                  </div>
                </Link>

                <Link
                  to="/products"
                  className="group relative overflow-hidden"
                >
                  <div className="luxury-button-secondary">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Explore Collection
                      <SparklesIcon className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side - Watch Display */}
          <div className="relative flex items-center justify-center h-full min-h-[600px]">
            {/* Watch Container with 3D Effect */}
            <div
              ref={watchRef}
              className="relative luxury-watch-container"
              style={{
                transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
              }}
            >
              {/* Ambient Glow Ring */}
              <div className="absolute inset-0 luxury-glow-ring"></div>

              {/* Watch Image with Reflections */}
              <div className="relative luxury-watch-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=90"
                  alt="Luxury Watch"
                  className="luxury-watch-image"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=90';
                  }}
                />
                
                {/* Light Reflection Overlay */}
                <div className="absolute inset-0 luxury-light-reflection"></div>
                
                {/* Glass Reflection */}
                <div className="absolute inset-0 luxury-glass-reflection"></div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-8 -right-8 luxury-floating-element element-1">
                <div className="w-16 h-16 border border-amber-500/30 rounded-full backdrop-blur-sm"></div>
              </div>
              <div className="absolute -bottom-8 -left-8 luxury-floating-element element-2">
                <div className="w-12 h-12 border border-amber-400/20 rounded-full backdrop-blur-sm"></div>
              </div>
            </div>

            {/* Background Blur Effect */}
            <div className="absolute inset-0 luxury-background-blur"></div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce-slow">
        <div className="w-6 h-10 border-2 border-amber-500/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-amber-500 rounded-full animate-scroll-indicator"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

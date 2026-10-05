import React from 'react';
import { Link } from 'react-router-dom';

const ExploreBoutiques = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-30"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Explore My Clock Boutiques Near You</h2>
          <div className="flex justify-center gap-12 mt-12">
            <div className="text-center animate-bounce-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-3">
                80+
              </div>
              <div className="text-gray-600 font-semibold">BOUTIQUES TO EXPLORE</div>
            </div>
            <div className="text-center animate-bounce-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-3">
                18+
              </div>
              <div className="text-gray-600 font-semibold">CITIES ALL ACROSS INDIA</div>
            </div>
          </div>
        </div>

        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <Link
            to="/boutiques"
            className="inline-block bg-gradient-to-r from-black to-gray-800 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-2xl hover:from-gray-800 hover:to-black transition-all duration-500 hover:scale-110 hover:shadow-3xl"
          >
            📍 LOCATE BOUTIQUES
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ExploreBoutiques;


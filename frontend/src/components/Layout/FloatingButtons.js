import React from 'react';
import { Link } from 'react-router-dom';
import { GiftIcon } from '@heroicons/react/24/solid';

const FloatingButtons = () => {
  return (
    <div className="fixed right-4 bottom-24 z-50 flex flex-col gap-4 animate-fade-in-up">
      {/* Rewards Button */}
      <Link
        to="/rewards"
        className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg shadow-2xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center gap-2 hover:scale-105 hover:shadow-3xl group"
        aria-label="Rewards"
      >
        <GiftIcon className="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0" />
        <span className="text-sm font-bold whitespace-nowrap hidden sm:inline">Rewards</span>
      </Link>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/918080656656?text=Hello%20My%20Clock%20Team"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#25D366] text-white w-14 h-14 rounded-full shadow-2xl hover:bg-[#20BA5A] transition-all duration-300 hover:scale-110 hover:shadow-3xl group animate-bounce-slow flex items-center justify-center"
        aria-label="Contact us on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <svg
          className="w-6 h-6 group-hover:scale-110 transition-transform"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .96 4.534.96 10.09c0 1.752.438 3.4 1.211 4.847L0 24l9.218-2.389a11.712 11.712 0 005.832 1.548h.005c6.554 0 11.89-5.335 11.89-11.889a11.848 11.848 0 00-3.432-8.348" />
        </svg>
      </a>
    </div>
  );
};

export default FloatingButtons;


import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircleIcon, ShoppingBagIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

const OrderSuccessModal = ({ isOpen, orderDetails, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // Launch confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Success Celebration Background */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600"></div>
            
            <div className="text-center relative z-10">
              {/* Checkmark Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
              >
                <CheckCircleIcon className="w-16 h-16 text-green-600" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-extrabold text-gray-900 mb-2"
              >
                Order Placed!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mb-8"
              >
                Hurray! Your order <span className="font-bold text-gray-900">#{orderDetails?.order_number || '12345'}</span> has been successfully placed.
              </motion.p>

              <div className="space-y-4">
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => onClose(true)}
                  className="w-full bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-95"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  View Order Details
                </motion.button>
                
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={() => onClose(false)}
                  className="w-full bg-gray-50 text-gray-700 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all active:scale-95"
                >
                  Continue Shopping
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Delivery Estimation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 pt-6 border-t border-gray-100"
              >
                <p className="text-xs text-gray-400">
                  Estimated delivery by <span className="font-semibold text-gray-600">5-7 Business Days</span>
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrderSuccessModal;

import React from 'react';

const WhyBuyFromUs = () => {
  return (
    <section className="py-16 bg-gray-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Buy From Us</h2>
        
        <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
          </div>
          
          {/* Content Overlay */}
          <div className="relative h-full flex items-center justify-center text-white p-8">
            <div className="text-center max-w-3xl">
              <h3 className="text-4xl font-bold mb-4">AFTER SALES-SERVICE</h3>
              <p className="text-xl text-gray-200 leading-relaxed">
                Expert care for your watch—maintenance, repairs, and support.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Authentic Products</h3>
            <p className="text-gray-600">100% genuine watches with warranty</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Free Shipping</h3>
            <p className="text-gray-600">Free delivery on orders above ₹999</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Returns</h3>
            <p className="text-gray-600">30-day return policy with full refund</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyBuyFromUs;


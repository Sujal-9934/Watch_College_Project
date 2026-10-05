import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  {
    name: 'Men\'s Watches',
    slug: 'mens-watches',
    image: '⌚',
    count: '250+ watches',
    description: 'Classic and contemporary styles for the modern gentleman'
  },
  {
    name: 'Women\'s Watches',
    slug: 'womens-watches',
    image: '⌚',
    count: '180+ watches',
    description: 'Elegant and stylish timepieces for every occasion'
  },
  {
    name: 'Luxury Watches',
    slug: 'luxury-watches',
    image: '⌚',
    count: '120+ watches',
    description: 'Prestigious timepieces from renowned luxury brands'
  },
  {
    name: 'Sports Watches',
    slug: 'sports-watches',
    image: '⌚',
    count: '90+ watches',
    description: 'Durable and functional watches for active lifestyles'
  },
  {
    name: 'Smart Watches',
    slug: 'smart-watches',
    image: '⌚',
    count: '75+ watches',
    description: 'Modern smartwatches with advanced features'
  },
  {
    name: 'Vintage Watches',
    slug: 'vintage-watches',
    image: '⌚',
    count: '60+ watches',
    description: 'Timeless vintage pieces with character and history'
  }
];

const CategoryGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Link
          key={category.slug}
          to={`/products?category=${category.slug}`}
          className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{category.image}</div>
              <div className="text-right">
                <div className="text-sm text-gray-500">{category.count}</div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
              {category.name}
            </h3>

            <p className="text-gray-600 text-sm leading-relaxed">
              {category.description}
            </p>

            <div className="mt-4 flex items-center text-primary-600 font-medium">
              <span>Explore</span>
              <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CategoryGrid;

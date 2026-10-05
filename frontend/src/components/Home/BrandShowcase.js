import React from 'react';
import { Link } from 'react-router-dom';

const brands = [
  {
    name: 'Rolex',
    slug: 'rolex',
    logo: '⌚',
    description: 'The epitome of luxury watchmaking since 1905'
  },
  {
    name: 'Omega',
    slug: 'omega',
    logo: '⌚',
    description: 'Swiss luxury watches known for precision and innovation'
  },
  {
    name: 'Casio',
    slug: 'casio',
    logo: '⌚',
    description: 'Reliable and affordable watches for everyday use'
  },
  {
    name: 'Fossil',
    slug: 'fossil',
    logo: '⌚',
    description: 'Contemporary watches with timeless appeal'
  },
  {
    name: 'Titan',
    slug: 'titan',
    logo: '⌚',
    description: 'Indian craftsmanship meets global standards'
  },
  {
    name: 'Seiko',
    slug: 'seiko',
    logo: '⌚',
    description: 'Japanese precision and innovative technology'
  }
];

const BrandShowcase = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
      {brands.map((brand) => (
        <Link
          key={brand.slug}
          to={`/products?brand=${brand.slug}`}
          className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center border border-gray-100 hover:border-primary-200"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
            {brand.logo}
          </div>
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
            {brand.name}
          </h3>
          <p className="text-xs text-gray-500 leading-tight">
            {brand.description}
          </p>
        </Link>
      ))}
    </div>
  );
};

export default BrandShowcase;

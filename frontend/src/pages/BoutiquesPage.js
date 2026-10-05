import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  MapPinIcon as MapPinIconSolid,
  PhoneIcon as PhoneIconSolid,
} from '@heroicons/react/24/solid';

const BoutiquesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Sample boutique data - In production, this would come from an API
  const boutiques = [
    {
      id: 1,
      name: 'My Clock Boutique - Bandra',
      city: 'Mumbai',
      address: 'Shop No. 12, Hill Road, Bandra West, Mumbai - 400050',
      area: 'Bandra',
      phone: '+91 22 2645 7890',
      email: 'bandra@myclock.in',
      openingHours: {
        weekdays: '10:00 AM - 8:00 PM',
        saturday: '10:00 AM - 9:00 PM',
        sunday: '11:00 AM - 7:00 PM',
      },
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      coordinates: { lat: 19.0596, lng: 72.8295 },
      features: ['Parking', 'Wheelchair Accessible', 'Gift Wrapping'],
    },
    {
      id: 2,
      name: 'My Clock Boutique - Andheri',
      city: 'Mumbai',
      address: 'Ground Floor, Oberoi Mall, Andheri West, Mumbai - 400053',
      area: 'Andheri',
      phone: '+91 22 2678 9012',
      email: 'andheri@myclock.in',
      openingHours: {
        weekdays: '11:00 AM - 9:00 PM',
        saturday: '11:00 AM - 10:00 PM',
        sunday: '11:00 AM - 8:00 PM',
      },
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      coordinates: { lat: 19.1364, lng: 72.8297 },
      features: ['Parking', 'Metro Connected', 'Gift Wrapping'],
    },
    {
      id: 3,
      name: 'My Clock Boutique - Connaught Place',
      city: 'Delhi',
      address: 'Shop No. 45, Inner Circle, Connaught Place, New Delhi - 110001',
      area: 'Connaught Place',
      phone: '+91 11 2345 6789',
      email: 'cp@myclock.in',
      openingHours: {
        weekdays: '10:00 AM - 8:00 PM',
        saturday: '10:00 AM - 9:00 PM',
        sunday: '11:00 AM - 7:00 PM',
      },
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      coordinates: { lat: 28.6304, lng: 77.2177 },
      features: ['Parking', 'Metro Connected', 'Wheelchair Accessible'],
    },
    {
      id: 4,
      name: 'My Clock Boutique - Saket',
      city: 'Delhi',
      address: 'Level 2, Select Citywalk, Saket, New Delhi - 110017',
      area: 'Saket',
      phone: '+91 11 2956 7890',
      email: 'saket@myclock.in',
      openingHours: {
        weekdays: '11:00 AM - 9:00 PM',
        saturday: '11:00 AM - 10:00 PM',
        sunday: '11:00 AM - 8:00 PM',
      },
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      coordinates: { lat: 28.5275, lng: 77.2189 },
      features: ['Parking', 'Mall Location', 'Gift Wrapping'],
    },
    {
      id: 5,
      name: 'My Clock Boutique - Koramangala',
      city: 'Bangalore',
      address: 'No. 80, 5th Block, Koramangala, Bangalore - 560095',
      area: 'Koramangala',
      phone: '+91 80 2556 7890',
      email: 'koramangala@myclock.in',
      openingHours: {
        weekdays: '10:00 AM - 8:00 PM',
        saturday: '10:00 AM - 9:00 PM',
        sunday: '11:00 AM - 7:00 PM',
      },
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      coordinates: { lat: 12.9352, lng: 77.6245 },
      features: ['Parking', 'Wheelchair Accessible', 'Gift Wrapping'],
    },
    {
      id: 6,
      name: 'My Clock Boutique - Indiranagar',
      city: 'Bangalore',
      address: '100 Feet Road, Indiranagar, Bangalore - 560038',
      area: 'Indiranagar',
      phone: '+91 80 2523 4567',
      email: 'indiranagar@myclock.in',
      openingHours: {
        weekdays: '10:00 AM - 8:00 PM',
        saturday: '10:00 AM - 9:00 PM',
        sunday: '11:00 AM - 7:00 PM',
      },
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      coordinates: { lat: 12.9784, lng: 77.6408 },
      features: ['Parking', 'Metro Connected', 'Gift Wrapping'],
    },
    {
      id: 7,
      name: 'My Clock Boutique - Koregaon Park',
      city: 'Pune',
      address: 'Shop No. 8, Koregaon Park, Pune - 411001',
      area: 'Koregaon Park',
      phone: '+91 20 2612 3456',
      email: 'koregaonpark@myclock.in',
      openingHours: {
        weekdays: '10:00 AM - 8:00 PM',
        saturday: '10:00 AM - 9:00 PM',
        sunday: '11:00 AM - 7:00 PM',
      },
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      coordinates: { lat: 18.5449, lng: 73.8956 },
      features: ['Parking', 'Wheelchair Accessible'],
    },
    {
      id: 8,
      name: 'My Clock Boutique - Viman Nagar',
      city: 'Pune',
      address: 'Ground Floor, Phoenix Marketcity, Viman Nagar, Pune - 411014',
      area: 'Viman Nagar',
      phone: '+91 20 2689 0123',
      email: 'vimanagar@myclock.in',
      openingHours: {
        weekdays: '11:00 AM - 9:00 PM',
        saturday: '11:00 AM - 10:00 PM',
        sunday: '11:00 AM - 8:00 PM',
      },
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      coordinates: { lat: 18.5679, lng: 73.9123 },
      features: ['Parking', 'Mall Location', 'Gift Wrapping'],
    },
    {
      id: 9,
      name: 'My Clock Boutique - Banjara Hills',
      city: 'Hyderabad',
      address: 'Road No. 12, Banjara Hills, Hyderabad - 500034',
      area: 'Banjara Hills',
      phone: '+91 40 2345 6789',
      email: 'banjarahills@myclock.in',
      openingHours: {
        weekdays: '10:00 AM - 8:00 PM',
        saturday: '10:00 AM - 9:00 PM',
        sunday: '11:00 AM - 7:00 PM',
      },
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      coordinates: { lat: 17.4239, lng: 78.4481 },
      features: ['Parking', 'Wheelchair Accessible', 'Gift Wrapping'],
    },
    {
      id: 10,
      name: 'My Clock Boutique - Jubilee Hills',
      city: 'Hyderabad',
      address: 'Plot No. 123, Jubilee Hills, Hyderabad - 500033',
      area: 'Jubilee Hills',
      phone: '+91 40 2456 7890',
      email: 'jubileehills@myclock.in',
      openingHours: {
        weekdays: '10:00 AM - 8:00 PM',
        saturday: '10:00 AM - 9:00 PM',
        sunday: '11:00 AM - 7:00 PM',
      },
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      coordinates: { lat: 17.4250, lng: 78.4081 },
      features: ['Parking', 'Gift Wrapping'],
    },
  ];

  const cities = ['all', ...new Set(boutiques.map(b => b.city))];

  useEffect(() => {
    if (selectedCity !== 'all') {
      setSearchParams({ city: selectedCity });
    } else {
      setSearchParams({});
    }
  }, [selectedCity, setSearchParams]);

  const filteredBoutiques = boutiques.filter(boutique => {
    const matchesCity = selectedCity === 'all' || boutique.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      boutique.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boutique.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boutique.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCity && matchesSearch;
  });

  const getDirectionsUrl = (boutique) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${boutique.coordinates.lat},${boutique.coordinates.lng}`;
  };

  const getMapUrl = (boutique) => {
    return `https://www.google.com/maps?q=${boutique.coordinates.lat},${boutique.coordinates.lng}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Our Boutiques</h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Visit us at our exclusive boutiques across India and experience luxury timepieces in person
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by boutique name, area, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* City Filter */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5 text-gray-500" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Cities</option>
                  {cities.filter(c => c !== 'all').map(city => (
                    <option key={city} value={city.toLowerCase()}>{city}</option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredBoutiques.length}</span> boutique{filteredBoutiques.length !== 1 ? 's' : ''}
            {selectedCity !== 'all' && ` in ${selectedCity}`}
          </div>
        </div>
      </div>

      {/* Boutiques Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredBoutiques.length === 0 ? (
          <div className="text-center py-16">
            <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No boutiques found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-6'
            }
          >
            {filteredBoutiques.map((boutique, index) => (
              <div
                key={boutique.id}
                className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.02] animate-fade-in-up ${
                  viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image */}
                <div
                  className={`relative overflow-hidden ${
                    viewMode === 'list' ? 'md:w-80 h-64' : 'h-48'
                  }`}
                >
                  <img
                    src={boutique.image}
                    alt={boutique.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x600?text=My+Clock+Boutique';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg">
                    <span className="text-sm font-semibold text-primary-600">{boutique.city}</span>
                  </div>
                </div>

                {/* Content */}
                <div className={`p-6 flex-1 ${viewMode === 'list' ? 'md:flex md:flex-col md:justify-between' : ''}`}>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{boutique.name}</h3>
                    <div className="space-y-3 mb-4">
                      {/* Address */}
                      <div className="flex items-start gap-3">
                        <MapPinIconSolid className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{boutique.area}</p>
                          <p className="text-sm text-gray-600">{boutique.address}</p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center gap-3">
                        <PhoneIconSolid className="h-5 w-5 text-primary-600 flex-shrink-0" />
                        <a
                          href={`tel:${boutique.phone}`}
                          className="text-sm text-gray-700 hover:text-primary-600 transition-colors"
                        >
                          {boutique.phone}
                        </a>
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-3">
                        <EnvelopeIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />
                        <a
                          href={`mailto:${boutique.email}`}
                          className="text-sm text-gray-700 hover:text-primary-600 transition-colors"
                        >
                          {boutique.email}
                        </a>
                      </div>

                      {/* Opening Hours */}
                      <div className="flex items-start gap-3">
                        <ClockIcon className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-700">
                          <p className="font-medium">Opening Hours:</p>
                          <p>Mon-Fri: {boutique.openingHours.weekdays}</p>
                          <p>Sat: {boutique.openingHours.saturday}</p>
                          <p>Sun: {boutique.openingHours.sunday}</p>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {boutique.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-200">
                    <a
                      href={getDirectionsUrl(boutique)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-center text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <MapPinIcon className="h-4 w-4" />
                      Get Directions
                    </a>
                    <a
                      href={getMapUrl(boutique)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 border border-primary-600 text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-center text-sm font-semibold transition-colors"
                    >
                      View on Map
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-primary-600 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Can't Find a Boutique Near You?</h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Contact us and we'll help you find the perfect timepiece or arrange a private viewing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+918080656656"
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              <PhoneIcon className="h-5 w-5" />
              Call Us: +91 80806 56656
            </a>
            <a
              href="mailto:customercare@myclock.in"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors inline-flex items-center justify-center gap-2"
            >
              <EnvelopeIcon className="h-5 w-5" />
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoutiquesPage;


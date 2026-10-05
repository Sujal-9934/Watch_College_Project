import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchFeaturedProducts } from '../redux/slices/productSlice';
import CinematicHero from '../components/Home/CinematicHero';
import HeroSection from '../components/Home/HeroSection';
import FeaturedBrands from '../components/Home/FeaturedBrands';
import CategoryCarousel from '../components/Home/CategoryCarousel';
import MostLovedBrands from '../components/Home/MostLovedBrands';
import NewArrivals from '../components/Home/NewArrivals';
import OffersForYou from '../components/Home/OffersForYou';
import WhyBuyFromUs from '../components/Home/WhyBuyFromUs';
import CelebrityLook from '../components/Home/CelebrityLook';
import InspirationSection from '../components/Home/InspirationSection';
import ExploreBoutiques from '../components/Home/ExploreBoutiques';
import SpottedWithJIT from '../components/Home/SpottedWithJIT';

const HomePage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch featured products for homepage
    dispatch(fetchFeaturedProducts(8));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white">
      {/* Cinematic Hero Section */}
      <CinematicHero />

      {/* Featured Brands Section */}
      <FeaturedBrands />

      {/* Shop By Category Section */}
      <CategoryCarousel />

      {/* Most Loved Brands Section */}
      <MostLovedBrands />

      {/* New Arrivals Section */}
      <NewArrivals />

      {/* Offers For You Section */}
      <OffersForYou />

      {/* Why Buy From Us Section */}
      <WhyBuyFromUs />

      {/* Shop The Celebrity Look Section */}
      <CelebrityLook />

      {/* Inspiration Section */}
      <InspirationSection />

      {/* Explore Boutiques Section */}
      <ExploreBoutiques />

      {/* Spotted With Just In Time Section */}
      <SpottedWithJIT />
    </div>
  );
};

export default HomePage;

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBrands } from '../../../redux/slices/brandSlice';
import { fetchCategories } from '../../../redux/slices/categorySlice';
import { API_BASE_URL, fetchJson } from '../../../utils/api';

const NavigationMenu = () => {
  const dispatch = useDispatch();
  const brands = useSelector((state) => (
    Array.isArray(state.brands?.brands) ? state.brands.brands : []
  ));
  const categories = useSelector((state) => (
    Array.isArray(state.categories?.categories) ? state.categories.categories : []
  ));
  const [premiumProducts, setPremiumProducts] = useState([]);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const closeTimeoutRef = useRef(null);
  const menuRefs = useRef({});

  useEffect(() => {
    if (brands.length === 0) {
      dispatch(fetchBrands());
    }
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, brands.length, categories.length]);

  useEffect(() => {
    // Fetch top 6 most expensive products for Premium Watches menu
    const fetchPremiumProducts = async () => {
      try {
        const data = await fetchJson(`${API_BASE_URL}/products?sort=price&order=desc&limit=6`);
        const products = data?.data;
        if (!Array.isArray(products)) {
          throw new Error('Premium products response is missing an array in its data field.');
        }

        setPremiumProducts(products.map((product) => ({
          name: product?.name || 'Watch',
          link: `/products/${product?.id}`,
          image: product?.images?.[0],
          price: product?.price,
          type: 'product'
        })));
      } catch (error) {
        setPremiumProducts([]);
        console.error(
          'Failed to fetch premium products:',
          `${error.message} Set REACT_APP_API_URL to the deployed backend URL ending in /api.`
        );
      }
    };

    fetchPremiumProducts();
  }, [dispatch]);

  // Handle menu hover with delay
  const handleMenuEnter = (menuKey) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setHoveredMenu(menuKey);
  };

  const handleMenuLeave = (menuKey) => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 200); // 200ms delay before closing
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Build menu configs based on the image provided
  const { menuConfigs, menuOrder } = React.useMemo(() => {
    const configs = {
      'men': {
        title: 'MEN',
        link: '/products?category=mens-watches',
        items: (categories || [])
          .filter(c => c?.slug?.includes('men'))
          .map(c => ({ name: c?.name, link: `/products?category=${c?.slug}`, image: c?.image })),
        type: 'category'
      },
      'women': {
        title: 'WOMEN',
        link: '/products?category=womens-watches',
        items: (categories || [])
          .filter(c => c?.slug?.includes('women'))
          .map(c => ({ name: c?.name, link: `/products?category=${c?.slug}`, image: c?.image })),
        type: 'category'
      },
      'smart-watches': {
        title: 'SMART WATCHES',
        link: '/products?category=smart-watches',
        items: [],
        type: 'nav-link'
      },
      'premium-watches': {
        title: 'PREMIUM WATCHES',
        link: '/products?sort=price&order=desc',
        items: premiumProducts,
        type: 'product'
      },
      'watches': {
        title: 'WATCHES',
        link: '/products',
        items: (categories || [])
          .filter(Boolean)
          .slice(0, 10)
          .map(c => ({ name: c?.name, link: `/products?category=${c?.slug}`, image: c?.image })),
        viewAllLink: '/products',
        type: 'category'
      },
      'international-brands': {
        title: 'INTERNATIONAL BRANDS',
        link: '/products?filter=international',
        items: (brands || []).slice(0, 9).map(b => ({ name: b?.name, slug: b?.slug, logo: b?.logo, link: `/products?brand=${b?.slug}` })),
        viewAllLink: '/products?filter=brand',
        type: 'brand'
      },
      'our-brands': {
        title: 'OUR BRANDS',
        link: '/products?filter=our-brands',
        items: (brands || []).slice(9, 15).map(b => ({ name: b?.name, slug: b?.slug, logo: b?.logo, link: `/products?brand=${b?.slug}` })),
        viewAllLink: '/products?filter=brand',
        type: 'brand'
      }
    };

    const order = ['men', 'women', 'smart-watches', 'premium-watches', 'watches', 'international-brands', 'our-brands'];

    return { menuConfigs: configs, menuOrder: order };
  }, [brands, categories, premiumProducts]);

  const renderMenuContent = (menuKey) => {
    const config = menuConfigs[menuKey];
    if (!config || !config.items || config.items.length === 0) return null;

    const isBrandMenu = config.type === 'brand';

    return (
      <>
        <div
          className="absolute top-full left-0 right-0 h-2 z-40"
          onMouseEnter={() => handleMenuEnter(menuKey)}
          onMouseLeave={() => handleMenuLeave(menuKey)}
        />
        <div
          ref={(el) => (menuRefs.current[menuKey] = el)}
          className="absolute top-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 py-4 z-50 min-w-[500px] max-w-[600px]"
          style={{
            left: menuKey === 'men' ? '0' : menuKey === 'our-brands' ? 'auto' : '50%',
            right: menuKey === 'our-brands' ? '0' : 'auto',
            transform: menuKey === 'men' || menuKey === 'our-brands' ? 'none' : 'translateX(-50%)'
          }}
          onMouseEnter={() => handleMenuEnter(menuKey)}
          onMouseLeave={() => handleMenuLeave(menuKey)}
        >
          <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-900 tracking-wider text-center">{config.title}</h3>
          </div>
          <div className="px-4 py-3 max-h-[400px] overflow-y-auto scrollbar-hide">
            <div className={`grid ${isBrandMenu ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
              {config.items.map((item, index) => (
                <Link
                  key={item.slug ?? item.name ?? index}
                  to={item.link}
                  className="group flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setHoveredMenu(null)}
                >
                  {item.image && (
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-100 group-hover:border-primary-200">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 group-hover:text-primary-600 transition-colors font-medium truncate">
                      {item.name}
                    </p>
                    {item.price && (
                      <p className="text-xs text-primary-600 font-bold mt-0.5">
                        ₹{parseFloat(item.price).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          {config.viewAllLink && (
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-center">
              <Link
                to={config.viewAllLink}
                className="text-primary-600 hover:text-primary-700 font-semibold text-xs tracking-wider"
                onClick={() => setHoveredMenu(null)}
              >
                VIEW ALL {config.title}
              </Link>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <nav className="hidden lg:flex items-center justify-center space-x-6 pb-4 border-t border-gray-100 pt-4">
      {menuOrder.map((key) => {
        const config = menuConfigs[key];
        if (!config) return null;
        return (
          <div
            key={key}
            className="relative"
            onMouseEnter={() => handleMenuEnter(key)}
            onMouseLeave={() => handleMenuLeave(key)}
          >
            <Link
              to={config.link}
              className={`block px-2 py-2 text-gray-800 hover:text-primary-600 font-medium text-xs tracking-[0.15em] transition-all relative ${hoveredMenu === key ? 'text-primary-600' : ''
                }`}
            >
              {config.title}
              {hoveredMenu === key && (
                <span className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-primary-600 transition-all duration-300"></span>
              )}
            </Link>
            {hoveredMenu === key && renderMenuContent(key)}
          </div>
        );
      })}
    </nav>
  );
};

export default NavigationMenu;
